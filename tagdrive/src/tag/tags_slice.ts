import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store.js';
import { FileID, FileTagData, Tag, TagID, TagList } from "./tag_types.js";
import { GoogleFile } from '../drive/google_types.js';


const initial_tags: Tag[] = Array(5).fill(null as Tag | null)


export const tagsSlice = createSlice({
    name: 'tags',
    initialState: {
        modified: false,
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
        setModified: (state, action) => {
            state.modified = action.payload;
        },
        setTagMetadata: (state, action) => {
            // state.modified = true;
            state.tag_metadata = action.payload;
        },
        modifyTagMetadata: (state, action) => {
            state.modified = true;
            const {tag_id, tag_data} = action.payload;
            // Get current tag data
            const current_tag_data = state.tag_metadata[tag_id];
            let is_new = false;
            if (!current_tag_data) {
                is_new = true;
            }
            // If the tag's parent has changed, remove the tag from the parent's children
            // and add it to the new parent's children
            if (is_new || current_tag_data.parent !== tag_data.parent) {
                if (current_tag_data && current_tag_data.parent !== "") {
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
            if (is_new || current_tag_data.children !== tag_data.children) {
                current_tag_data?.children.forEach((child_id) => {
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
                if (file_data.search_string.includes(tag_id)) {
                    // Modify the search string for the file
                    const search_string = file_data.tags.map(
                        (tag_id: string) => generate_search_string(state, tag_id)
                    ).join(" ");
                    file_data.search_string = search_string;
                }
                tag_data.children.forEach((child_id: string) => {
                    if (file_data.search_string.includes(child_id)) {
                        // Modify the search string for the file
                        const search_string = file_data.tags.map(
                            (tag_id: string) => generate_search_string(state, tag_id)
                        ).join(" ");
                        file_data.search_string = search_string;
                    }
                });
            });

            console.log("Modified tag", tag_id, "in tag metadata and all files")
            console.log("Final tag data", state.tag_metadata[tag_id])

        },
        deleteTagMetadata: (state, action) => {
            state.modified = true;
            const tag_id = action.payload;
            // If the tag id is empty, do nothing
            if (tag_id === "") {
                return;
            }

            // Get tag data
            const tag_data = state.tag_metadata[tag_id];
            // Tag does not exist, no need to delete
            if (!tag_data) {
                return;
            }
            // If the tag has a parent, remove the tag from the parent's children
            if (tag_data.parent !== "") {
                const parent = state.tag_metadata[tag_data.parent];
                parent.children = parent.children.filter((child_id) => child_id !== tag_id);
            }
            // If the tag has children, remove the tag as the parent of the children
            tag_data.children.forEach((child_id) => {
                const child = state.tag_metadata[child_id];
                child.parent = "";
            });
            // Update the tag metadata
            delete state.tag_metadata[tag_id];
            // Remove this tag from all files and update search strings accordingly
            Object.entries(state.file_tags).forEach(([file_id, file_data]) => {
                // Probably not the best practice, but we can find all files
                // that have this tag or a child of this tag by seeing if the
                // search string contains the tag id (which it always does). Even
                // if the file doesn't have the tag, re-generating its search string
                // is harmless.
                if (file_data.search_string.includes(tag_id)) {
                    // Remove the tag from the file
                    file_data.tags = file_data.tags.filter((id) => id !== tag_id);
                    if (file_data.tags.length === 0) {
                        delete state.file_tags[file_id];
                        return;
                    }
                    // Re-generate the search string for the file
                    const search_string = file_data.tags.map(
                        (tag_id: string) => generate_search_string(state, tag_id)
                    ).join(" ");
                    console.log("File", file_id, "has new search string", search_string)
                    file_data.search_string = search_string;
                }
            });
            console.log("Deleted tag", tag_id, "from tag metadata and all files")

        },
        setTagFileMetaData: (state, action) => {
            // state.modified = true;
            state.tag_file_metadata = action.payload;
        },
        setFileTags: (state, action) => {
            // state.modified = true;
            state.file_tags = action.payload;
        },
        addTagToFileID: (state, action) => {
            state.modified = true;
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
            state.modified = true;
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
    setModified,
    setTagMetadata,
    modifyTagMetadata,
    deleteTagMetadata,
    setTagFileMetaData,
    setFileTags,
    addTagToFileID,
    removeTagFromFileID,
    setQueriedTags,
    resetQueriedTags,
    setModifyingTagData,
} = tagsSlice.actions

export const getModified = (state: RootState) => state.tags.modified
export const getTagMetadata = (state: RootState) => state.tags.tag_metadata
export const getTagFileID = (state: RootState) => state.tags.tag_file_id
export const getTagFileMetadata = (state: RootState) => state.tags.tag_file_metadata
export const getFileTags = (state: RootState) => state.tags.file_tags
export const getQueriedTags = (state: RootState) => state.tags.queried_tags
export const getModifyingTagData = (state: RootState) => state.tags.modifying_tag_data

export const getTagByID = (id: TagID) => (state: RootState) => state.tags.tag_metadata[id]

export const getFileTagsByID = (id: FileID) => (state: RootState) => state.tags.file_tags[id]

// @ts-expect-error - This is a thunk
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
