import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store.js';
import { FileID, FileTagData, Tag, TagID, TagList } from "./tag_types.js";
import { GoogleFile } from '../drive/google_types.js';


const initial_tags: Tag[] = Array(5).fill(null as Tag | null)


export const tagsSlice = createSlice({
    name: 'tags',
    initialState: {
        tag_metadata: {} as TagList,
        tag_file_id: "",
        tag_file_metadata: {} as GoogleFile,
        file_tags: {} as FileTagData,
        queried_tags: initial_tags,
        modifying_tag_data: {
            name: "",
            color: "",
            aliases: [] as string[],
            children: [] as string[],
            parent: "",
            is_new: true,
            blurred_name: false,
            blurred_color: false,
        },
    },
    reducers: {
        setTagMetadata: (state, action) => {
            state.tag_metadata = action.payload;
        },
        modifyTagMetadata: (state, action) => {
            const {tag_id, tag_data} = action.payload;
            // Get current tag data
            const current_tag_data = state.tag_metadata[tag_id];
            if (!current_tag_data) {
                // Create new tag
                state.tag_metadata[tag_id] = tag_data;
                return;
            }
            // If the tag's parent has changed, remove the tag from the parent's children
            // and add it to the new parent's children
            if (current_tag_data.parent !== tag_data.parent) {
                if (current_tag_data.parent !== "") {
                    const parent = state.tag_metadata[current_tag_data.parent];
                    parent.children = parent.children.filter((child_id) => child_id !== tag_id);
                }
                if (tag_data.parent !== "") {
                    const new_parent = state.tag_metadata[tag_data.parent];
                    new_parent.children.push(tag_id);
                }
            }
            // If the tag's children have changed, remove the tag as its children's parent
            // and add it as the parent of the new children
            if (current_tag_data.children !== tag_data.children) {
                current_tag_data.children.forEach((child_id) => {
                    const child = state.tag_metadata[child_id];
                    child.parent = "";
                });
                tag_data.children.forEach((child_id: string) => {
                    const child = state.tag_metadata[child_id];
                    child.parent = tag_id;
                });
            }
            // Update the tag metadata
            state.tag_metadata[tag_id] = tag_data;
            // Update the search strings for all files with this tag
            Object.values(state.file_tags).forEach((file_data) => {
                if (file_data.tags.includes(tag_id)) {
                    // Modify the search string for the file
                    // Generate search strings for the file
                    const search_string = file_data.tags.map(
                        (tag_id: string) => generate_search_string(state, tag_id)
                    ).join(" ");
                    // state.file_tags[file_id].search_string = search_string;
                    file_data.search_string = search_string;
                }
            });

        },
        setTagFileID: (state, action) => {
            state.tag_file_id = action.payload;
        },
        setTagFileMetaData: (state, action) => {
            state.tag_file_metadata = action.payload;
        },
        setFileTags: (state, action) => {
            state.file_tags = action.payload;
        },
        addTagToFileID: (state, action) => {
            const tag_id = action.payload.tag_id;
            const file_id = action.payload.file_id;
            if (!state.file_tags[file_id]) {
                // Initialize the file in the file_tags object
                state.file_tags[file_id] = {
                    tags: [],
                    search_string: "",
                }
            } 
            if (!state.file_tags[file_id].tags.includes(tag_id)) {
                state.file_tags[file_id].tags.push(tag_id);
            }
            // Generate search strings for the file
            const search_string = state.file_tags[file_id].tags.map(
                (tag_id: string) => generate_search_string(state, tag_id)
            ).join(" ");
            console.log("File", file_id, "has search string", search_string)
            state.file_tags[file_id].search_string = search_string;
        },
        removeTagFromFileID: (state, action) => {
            const tag_id = action.payload.tag_id;
            const file_id = action.payload.file_id;
            // If the file does not exist, do nothing
            if (!state.file_tags[file_id]) {
                return;
            } 
            // If the file does not have the tag, do nothing
            if (!state.file_tags[file_id].tags.includes(tag_id)) {
                return;
            }
            // Remove the tag from the file
            console.log("Removing tag", tag_id, "from file", file_id, "tags", state.file_tags[file_id].tags)
            state.file_tags[file_id].tags = state.file_tags[file_id].tags.filter((id) => id !== tag_id);
            // If the file now has no tags, remove it from the file_tags object
            if (state.file_tags[file_id].tags.length === 0) {
                delete state.file_tags[file_id];
                return;
            }
            // Generate a new strings for the file
            const search_string = state.file_tags[file_id].tags.map(
                (tag_id: string) => generate_search_string(state, tag_id)
            ).join(" ");
            console.log("File", file_id, "has search string", search_string)
            state.file_tags[file_id].search_string = search_string;
        },
        setQueriedTags: (state, action) => {
            state.queried_tags = action.payload;
        },
        resetQueriedTags: (state) => {
            state.queried_tags = Object.values(state.tag_metadata);
        },
        setModifyingTagData: (state, action) => {
            state.modifying_tag_data = action.payload;
        },
    },
})

export const {
    setTagMetadata,
    modifyTagMetadata,
    setTagFileID,
    setTagFileMetaData,
    setFileTags,
    addTagToFileID,
    removeTagFromFileID,
    setQueriedTags,
    resetQueriedTags,
    setModifyingTagData,
} = tagsSlice.actions

export const getTagMetadata = (state: RootState) => state.tags.tag_metadata
export const getTagFileID = (state: RootState) => state.tags.tag_file_id
export const getTagFileMetadata = (state: RootState) => state.tags.tag_file_metadata
export const getFileTags = (state: RootState) => state.tags.file_tags
export const getQueriedTags = (state: RootState) => state.tags.queried_tags
export const getModifyingTagData = (state: RootState) => state.tags.modifying_tag_data

export const getTagByID = (id: TagID) => (state: RootState) => state.tags.tag_metadata[id]

export const getFileTagsByID = (id: FileID) => (state: RootState) => state.tags.file_tags[id]

const generate_search_string = (state, tag_id: TagID) => {
    if (tag_id === "") {
        return "";
    }
    if (!state.tag_metadata[tag_id]) {
        alert(`Tag with ID ${tag_id} does not exist`)
        return "";
    }
    const tag: Tag = state.tag_metadata[tag_id];
    let this_search: string = `${tag.name}`;
    tag.aliases.forEach((alias) => {
        this_search += ` ${alias}`;
    });
    const parent_search: string = generate_search_string(state, tag.parent);
    if (parent_search === "") {
        return this_search;
    }
    return `${this_search} ${parent_search}`;
}



export default tagsSlice.reducer
