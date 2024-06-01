import { createSelector, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store.js';
import { tag_colors } from "../../tailwind.config.js";
import { FileID, FileTagData, Tag, TagFile, TagID, TagList } from "./tag_types.js";
import { GoogleFile } from '../drive/google_types.js';


const allowed_colors = tag_colors;


export const tagsSlice = createSlice({
    name: 'tags',
    initialState: {
        tag_metadata: {} as TagList,
        tag_file_id: "",
        tag_file_metadata: {} as GoogleFile,
        file_tags: {} as FileTagData,
        typed_tags: [] as TagID[],
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
            // const tag = state.tag_metadata[tag_id];
            // const this_search = tag.aliases.join(" ") + " " + tag.name;
            // const children_search = tag.children.map((child) => generate_search_string(state.tag_metadata[child])).join(" ");
            // state.file_tags[file_id].search_string = this_search + " " + children_search;
        },
    },
})

export const {
    setTagMetadata,
    setTagFileID,
    setTagFileMetaData,
    setFileTags,
    addTagToFileID,
} = tagsSlice.actions

export const getTagMetadata = (state: RootState) => state.tags.tag_metadata
export const getTagFileID = (state: RootState) => state.tags.tag_file_id
export const getTagFileMetadata = (state: RootState) => state.tags.tag_file_metadata
export const getFileTags = (state: RootState) => state.tags.file_tags

const getTagID = (state: RootState, id: TagID) => id
export const getTagByID = createSelector(
    [getTagMetadata, getTagID],
    (tags: TagList, tagId: TagID) => tags[tagId]
)

const getFileTagsID = (state: RootState, id: FileID) => id
export const getFileTagsByID = createSelector(
    [getFileTags, getFileTagsID],
    (file_tags: FileTagData, fileID: FileID) => file_tags[fileID]
)



export default tagsSlice.reducer
