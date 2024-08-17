import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store.js";
import {
    FileData,
    FileID,
    FileList,
    FileModification,
    FileModificationType,
} from "../file/file_types.js";
import { Tag, TagID } from "../tag/tag_types.js";
// import { TagID } from "../tag/tag_types.js";
// import { generate_search_string } from "./slice_tags.js";

const filesSlice = createSlice({
    name: "files",
    initialState: {
        file_tag_map: {} as FileList,
        file_mod_queue: [] as FileModification[],
    },
    reducers: {
        setFileTagMap: (state, action: PayloadAction<FileList>) => {
            state.file_tag_map = action.payload;
        },
        clearFileModQueue: (state) => {
            state.file_mod_queue = [];
            // Also remove any files that have no tags
            const file_ids = Object.keys(state.file_tag_map);
            file_ids.forEach((file_id) => {
                const file = state.file_tag_map[file_id];
                if (file.tags.length === 0) {
                    delete state.file_tag_map[file_id];
                }
            });
        },
        modifyFile: (state, action: PayloadAction<FileModification>) => {
            if (action.payload.type === FileModificationType.DELETE) {
                state.file_tag_map[action.payload.file.gid] = {
                    ...action.payload.file,
                    tags: [],
                    search_string: "",
                };
            } else {
                state.file_tag_map[action.payload.file.gid] =
                    action.payload.file;
            }
            state.file_mod_queue.push(action.payload);
        },
    },
});

export const { setFileTagMap, modifyFile, clearFileModQueue } =
    filesSlice.actions;

export const getFileTagMap = (state: RootState) => state.files.file_tag_map;
export const getFileModQueue = (state: RootState) => state.files.file_mod_queue;

export const getFileTagsByID = (id: FileID) => (state: RootState) => {
    return state.files.file_tag_map[id];
};

export const getFilesWithTagNaive = (tag_id: TagID) => (state: RootState) => {
    // Get all files that contain the tag's name in their search string
    return Object.values(state.files.file_tag_map).filter((file) =>
        file.search_string.includes(tag_id),
    );
};

export const getFilesWithTag = (tag_id: TagID) => (state: RootState) => {
    // Get all files that contain the tag
    return Object.values(state.files.file_tag_map).filter((file) =>
        file.tags.includes(tag_id),
    );
};

/**
 * Generate a random file id, in the format FXXXXXXXX where X is a random hex digit.
 * @returns A generated file id string.
 */
export function generate_file_id(): string {
    return "F" + crypto.randomUUID().replace(/-/g, "");
}

/**
 * Generate a new empty file object
 */
export function generate_empty_file(file_id: FileID): FileData {
    return {
        sheet_id: generate_file_id(),
        gid: file_id,
        tags: [],
        search_string: "",
    };
}

// Thunks

export const generate_search_string = (state: RootState, tag_id: TagID) => {
    if (tag_id === "") {
        return "";
    }
    if (!state.tags.tag_list[tag_id]) {
        alert(`Tag with ID ${tag_id} does not exist`);
        return "";
    }
    const tag: Tag = state.tags.tag_list[tag_id];
    let this_search: string = `${tag.name}`;
    tag.aliases.forEach((alias) => {
        this_search += ` ${alias}`;
    });
    const parent_search: string = generate_search_string(state, tag.parent);
    if (parent_search === "") {
        return this_search;
    }
    return `${this_search} ${parent_search}`;
};

export const addTagToFile = createAsyncThunk(
    "files/addTagToFile",
    async (
        arg: { file_id: FileID; tag_id: string },
        { getState, dispatch },
    ) => {
        const state = getState() as RootState;
        const file_id = arg.file_id;
        const tag_id = arg.tag_id;
        const file_data = getFileTagsByID(file_id)(state);
        const search_string = generate_search_string(state, tag_id);
        if (file_data === undefined) {
            // Create file before adding
            const empty_file = generate_empty_file(file_id);
            empty_file.tags.push(tag_id);
            empty_file.search_string = search_string;
            dispatch(
                modifyFile({
                    file: empty_file,
                    type: FileModificationType.CREATE,
                }),
            );
            return;
        }
        // Add tag to file
        const new_file_data = {
            ...file_data,
            tags: [...file_data.tags, tag_id],
            search_string: file_data.search_string + " " + search_string,
        };
        dispatch(
            modifyFile({
                file: new_file_data,
                type: FileModificationType.UPDATE,
            }),
        );
    },
);

export const addTagsToFiles = createAsyncThunk(
    "files/addTagsToFiles",
    async (
        arg: { file_ids: FileID[]; tag_ids: TagID[] },
        { getState, dispatch },
    ) => {
        const state = getState() as RootState;
        const search_strings = arg.tag_ids.map((tag_id) =>
            generate_search_string(state, tag_id),
        );
        arg.file_ids.forEach((file_id) => {
            const file_data = getFileTagsByID(file_id)(state);
            if (file_data === undefined) {
                // Create file before adding
                const empty_file = generate_empty_file(file_id);
                empty_file.tags = arg.tag_ids;
                empty_file.search_string = search_strings.join(" ");
                dispatch(
                    modifyFile({
                        file: empty_file,
                        type: FileModificationType.CREATE,
                    }),
                );
                return;
            }
            // Determine which tags need to be added to this file
            const new_tags = arg.tag_ids.filter(
                (tag_id) => !file_data.tags.includes(tag_id),
            );
            // If no new tags need to be added, do nothing
            if (new_tags.length === 0) {
                return;
            }
            const new_tag_indices = new_tags.map((tag_id) =>
                arg.tag_ids.indexOf(tag_id),
            );
            const new_search_strings = new_tag_indices.map(
                (index) => search_strings[index],
            );
            // Add tags to file
            const new_file_data = {
                ...file_data,
                tags: [...file_data.tags, ...new_tags],
                search_string:
                    file_data.search_string +
                    (new_search_strings.length > 0 ? " " : "") +
                    new_search_strings.join(" "),
            };
            console.log("Updating file", new_file_data);
            dispatch(
                modifyFile({
                    file: new_file_data,
                    type: FileModificationType.UPDATE,
                }),
            );
        });
    },
);

export const removeTagFromFile = createAsyncThunk(
    "files/removeTagFromFile",
    async (
        arg: { file_id: FileID; tag_id: string },
        { getState, dispatch },
    ) => {
        const state = getState() as RootState;
        const file_id = arg.file_id;
        const tag_id = arg.tag_id;
        const file_data = getFileTagsByID(file_id)(state);
        // If the file does not exist, do nothing
        if (file_data === undefined) {
            return;
        }
        // Remove tag from file
        const new_tags = file_data.tags.filter((id) => id !== tag_id);
        // If the file has no more tags, delete it from the store
        if (new_tags.length === 0) {
            dispatch(
                modifyFile({
                    file: {
                        ...file_data,
                        tags: [],
                        search_string: "",
                    },
                    type: FileModificationType.DELETE,
                }),
            );
            return;
        }
        console.log("New tags", new_tags);
        // Re-generate the search string for each file
        const new_search_string = new_tags
            .map((tag_id) => generate_search_string(state, tag_id))
            .join(" ");
        // If the search string has not changed, do not update the file
        if (new_search_string === file_data.search_string) {
            return;
        }
        const new_file_data = {
            ...file_data,
            tags: new_tags,
            search_string: new_search_string,
        };
        dispatch(
            modifyFile({
                file: new_file_data,
                type: FileModificationType.UPDATE,
            }),
        );
    },
);

export default filesSlice.reducer;
