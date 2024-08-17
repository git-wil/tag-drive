import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store.js";
import {
    Tag,
    TagApplier,
    TagID,
    TagList,
    TagModification,
    TagModificationType,
} from "../tag/tag_types.js";
import {
    generate_search_string,
    getFilesWithTagNaive,
    modifyFile,
    removeTagFromFile,
} from "./slice_files.js";
import { FileModification, FileModificationType } from "../file/file_types.js";

const tagsSlice = createSlice({
    name: "tags",
    initialState: {
        tag_list: {} as TagList,
        tag_mod_queue: [] as TagModification[],
        // The currently queried tags
        queried_tags: Array(5).fill(null) as Tag[],
        // TODO: Implement tag editing
        // modifying_tag_data: {
        //     name: "",
        //     color: "",
        //     aliases: [] as string[],
        //     children: [] as string[],
        //     parent: "",
        //     is_new: true,
        //     blurred_name: false,
        //     blurred_color: false,
        // },
        // The indices of the currently selected tags
        selected_tag_indices: [] as TagID[],
        // The tags to apply for different inputs
        tag_appliers: {
            click: [] as TagID[],
            1: [] as TagID[],
            2: [] as TagID[],
            3: [] as TagID[],
            4: [] as TagID[],
            5: [] as TagID[],
            6: [] as TagID[],
            7: [] as TagID[],
            8: [] as TagID[],
            9: [] as TagID[],
            0: [] as TagID[],
        } as { [key: string]: TagID[] },
        visible_tag_applier: "click" as TagApplier,
    },
    reducers: {
        setTagList: (state, action: PayloadAction<TagList>) => {
            state.tag_list = action.payload;
        },
        clearTagModQueue: (state) => {
            state.tag_mod_queue = [];
        },
        modifyTag: (state, action: PayloadAction<TagModification>) => {
            if (action.payload.type === TagModificationType.DELETE) {
                delete state.tag_list[action.payload.tag.id];
            } else {
                state.tag_list[action.payload.tag.id] = action.payload.tag;
            }
            state.tag_mod_queue.push(action.payload);
        },
        // Query tag actions
        setQueriedTags: (state, action: PayloadAction<Tag[]>) => {
            const tags = action.payload;
            state.queried_tags = tags.sort((a, b) =>
                a.name.localeCompare(b.name),
            );
        },
        queryAllTags: (state) => {
            const tags = Object.values(state.tag_list);
            state.queried_tags = tags.sort((a, b) =>
                a.name.localeCompare(b.name),
            );
        },
        // Selected tag actions
        toggleSelectedTagIndex: (state, action: PayloadAction<TagID>) => {
            // Toggle the tag in the selected tag indices list
            const tag_id = action.payload;
            const selected_index = state.selected_tag_indices.indexOf(tag_id);
            if (selected_index === -1) {
                state.selected_tag_indices.push(tag_id);
            } else {
                state.selected_tag_indices.splice(selected_index, 1);
            }
            // Toggle the tag in the click tag applier
            const applier_index = state.tag_appliers["click"].indexOf(tag_id);
            if (applier_index === -1) {
                state.tag_appliers["click"].push(tag_id);
            } else {
                state.tag_appliers["click"].splice(applier_index, 1);
            }
        },
        clearSelectedTagIndices: (state) => {
            state.selected_tag_indices = [];
            state.tag_appliers["click"] = [];
        },
        // Tag application actions
        setClickedTagsAsApplier: (
            state,
            action: PayloadAction<{ applier: number }>,
        ) => {
            const applier = action.payload.applier;
            if (applier < 0 || applier > 9) {
                return;
            }
            state.tag_appliers[applier] = state.tag_appliers["click"];
        },
        toggleClickedTagsAsApplier: (
            state,
            action: PayloadAction<{ applier: number }>,
        ) => {
            const applier = action.payload.applier;
            for (const tag_id of state.tag_appliers["click"]) {
                const index = state.tag_appliers[applier].indexOf(tag_id);
                if (index === -1) {
                    state.tag_appliers[applier].push(tag_id);
                } else {
                    state.tag_appliers[applier].splice(index, 1);
                }
            }
        },
        addClickedTagsToApplier: (
            state,
            action: PayloadAction<{ applier: number }>,
        ) => {
            const applier = action.payload.applier;
            for (const tag_id of state.tag_appliers["click"]) {
                if (!state.tag_appliers[applier].includes(tag_id)) {
                    state.tag_appliers[applier].push(tag_id);
                }
            }
        },
        setVisibleTagApplier: (state, action: PayloadAction<TagApplier>) => {
            state.visible_tag_applier = action.payload;
        },
    },
});

export const {
    setTagList,
    clearTagModQueue,
    modifyTag,
    setQueriedTags,
    queryAllTags,
    toggleSelectedTagIndex,
    clearSelectedTagIndices,
    setClickedTagsAsApplier,
    toggleClickedTagsAsApplier,
    addClickedTagsToApplier,
    setVisibleTagApplier,
} = tagsSlice.actions;

export const getTagModQueue = (state: RootState) => state.tags.tag_mod_queue;
export const getTagList = (state: RootState) => state.tags.tag_list;
// Query tag selectors
export const getQueriedTags = (state: RootState) => state.tags.queried_tags;
// Selected tag selectors
export const getSelectedTagIndices = (state: RootState) => {
    return state.tags.selected_tag_indices;
};
export const isTagSelected = (tag_id: TagID) => (state: RootState) => {
    return state.tags.selected_tag_indices.includes(tag_id);
};
export const areTagsSelected = (state: RootState) => {
    return state.tags.selected_tag_indices.length > 0;
};

export const getTagByID = (id: TagID) => (state: RootState) => {
    return state.tags.tag_list[id];
};

export const getTagsByApplier = (applier: TagApplier) => (state: RootState) => {
    return state.tags.tag_appliers[applier];
};

export const getVisibleTagApplier = (state: RootState) => {
    return state.tags.visible_tag_applier;
};

export const getVisibleTagApplierTags = (state: RootState) => {
    return state.tags.tag_appliers[state.tags.visible_tag_applier];
};

/**
 * Generate a specific number of random tag ids, in the format TXXXXXXXX where X
 * is a random hex digit. The number of ids generated is 1 by default.
 * @param number_of_ids The number of tag ids to generate
 * @returns A list of tag id strings.
 */
export function generate_tag_ids(number_of_ids: number = 1): string[] {
    const ids = [];
    for (let i = 0; i < number_of_ids; i++) {
        ids.push("T" + crypto.randomUUID().replace(/-/g, ""));
    }
    return ids;
}

// Thunks

export const createTag = createAsyncThunk(
    "tags/createTag",
    async (tag_data: Tag, { dispatch }) => {
        // Create a tag with no parent or children and add it to the tag list
        const tag_modification: TagModification = {
            type: TagModificationType.CREATE,
            tag: {
                id: tag_data.id,
                name: tag_data.name,
                color: tag_data.color,
                icon: tag_data.icon,
                aliases: tag_data.aliases,
                children: [],
                parent: "",
            },
        };
        dispatch(modifyTag(tag_modification));
        // Update the tag using the updateTag thunk to ensure that the tag's parent
        // and children are correctly updated
        dispatch(updateTag(tag_data));
    },
);

export const updateTag = createAsyncThunk(
    "tags/updateTag",
    async (tag_data: Tag, { getState, dispatch }) => {
        const state = getState() as RootState;
        const tag_id = tag_data.id;
        if (!state.tags.tag_list[tag_id]) {
            alert(`Tag with ID ${tag_id} does not exist and cannot be updated`);
            return;
        }
        const existing_tag_data = state.tags.tag_list[tag_id];
        // If the tag's parent has changed, remove the tag from the parent's children
        // and add it to the new parent's children
        if (existing_tag_data.parent !== tag_data.parent) {
            // If the tag had a parent, remove it as the parent's child
            if (existing_tag_data.parent !== "") {
                const parent = state.tags.tag_list[existing_tag_data.parent];
                parent.children = parent.children.filter(
                    (child_id) => child_id !== tag_id,
                );
            }
            // If the tag has a new parent, add it as the parent's child
            if (tag_data.parent !== "") {
                const new_parent = state.tags.tag_list[tag_data.parent];
                new_parent.children.push(tag_id);
            }
        }
        // If the tag's children have changed, remove the tag as its children's parent
        // and add it as the parent of the new children
        if (existing_tag_data.children !== tag_data.children) {
            // Remove the tag as the parent of its existing children
            existing_tag_data.children.forEach((child_id) => {
                const child = state.tags.tag_list[child_id];
                child.parent = "";
            });
            // Add the tag as the parent of its new children
            tag_data.children.forEach((child_id: string) => {
                const child = state.tags.tag_list[child_id];
                child.parent = tag_id;
            });
        }
        // Update the tag itself
        const tag_modification: TagModification = {
            type: TagModificationType.UPDATE,
            tag: tag_data,
        };
        dispatch(modifyTag(tag_modification));

        // Update the search string for all files that contain the tag
        const files_to_update = getFilesWithTagNaive(tag_id)(state);
        files_to_update.forEach((file) => {
            // Re-generate the search string for each file
            const new_search_string = file.tags
                .map((tag_id) => generate_search_string(state, tag_id))
                .join(" ");
            // If the search string has not changed, do not update the file
            if (new_search_string === file.search_string) {
                return;
            }
            const file_modification: FileModification = {
                type: FileModificationType.UPDATE,
                file: {
                    ...file,
                    search_string: new_search_string,
                },
            };
            dispatch(modifyFile(file_modification));
        });
    },
);

export const deleteTag = createAsyncThunk(
    "tags/deleteTag",
    async (tag_id: TagID, { getState, dispatch }) => {
        const state = getState() as RootState;
        if (!state.tags.tag_list[tag_id]) {
            alert(`Tag with ID ${tag_id} does not exist and cannot be deleted`);
            return;
        }
        // Get tag data
        const tag_data = state.tags.tag_list[tag_id];
        // If the tag has a parent, remove the tag from the parent's children
        if (tag_data.parent !== "") {
            const parent = state.tags.tag_list[tag_data.parent];
            parent.children = parent.children.filter(
                (child_id) => child_id !== tag_id,
            );
        }
        // If the tag has children, remove the tag as the parent of the children
        tag_data.children.forEach((child_id) => {
            const child = state.tags.tag_list[child_id];
            child.parent = "";
        });

        // Delete the tag itself
        const tag_modification: TagModification = {
            type: TagModificationType.DELETE,
            tag: tag_data,
        };
        dispatch(modifyTag(tag_modification));

        // Update all files that contain the tag
        const files_to_update = getFilesWithTagNaive(tag_id)(state);
        files_to_update.forEach((file) => {
            dispatch(removeTagFromFile({ file_id: file.gid, tag_id }));
        });
    },
);

export default tagsSlice.reducer;
