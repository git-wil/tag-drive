import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store.js';
import { tag_colors } from "../../tailwind.config.js";
import { FileID, FileTagData, Tag, TagID, TagList } from "./tag_types.js";
import { GoogleFile } from '../drive/google_types.js';


const allowed_colors = tag_colors;

const initial_tags: Tag[] = Array(5).fill(null as Tag | null)


export const tagsSlice = createSlice({
    name: 'tags',
    initialState: {
        tag_metadata: {} as TagList,
        tag_file_id: "",
        tag_file_metadata: {} as GoogleFile,
        file_tags: {} as FileTagData,
        queried_tags: initial_tags,
    },
    reducers: {
        setTagMetadata: (state, action) => {
            state.tag_metadata = action.payload;
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
            const search_string = generate_search_string(state, tag_id);
            console.log("File", file_id, "has search string", search_string)
            state.file_tags[file_id].search_string = search_string;
        },
        setQueriedTags: (state, action) => {
            state.queried_tags = action.payload;
        },
    },
})

export const {
    setTagMetadata,
    setTagFileID,
    setTagFileMetaData,
    setFileTags,
    addTagToFileID,
    setQueriedTags,
} = tagsSlice.actions

export const getTagMetadata = (state: RootState) => state.tags.tag_metadata
export const getTagFileID = (state: RootState) => state.tags.tag_file_id
export const getTagFileMetadata = (state: RootState) => state.tags.tag_file_metadata
export const getFileTags = (state: RootState) => state.tags.file_tags
export const getQueriedTags = (state: RootState) => state.tags.queried_tags

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
