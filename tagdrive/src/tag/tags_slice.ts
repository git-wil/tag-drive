import { createSelector, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store.js';
import { tag_colors } from "../../tailwind.config.js";
import { Tag, TagID, TagList } from "./tag_types.js";
import { GoogleFile } from '../drive/google_types.js';


const allowed_colors = tag_colors;


export const tagsSlice = createSlice({
  name: 'tags',
  initialState: {
    tags: {} as TagList,
    tag_file_id: "",
    tag_file_metadata: {} as GoogleFile,
    typed_tags: [] as TagID[],
  },
  reducers: {
    setTags: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.tags = action.payload;
    },
    setTagFileID: (state, action) => {
      state.tag_file_id = action.payload;
    },
    setTagFileMetaData: (state, action) => {
      state.tag_file_metadata = action.payload;
    },
  },
})

export const { setTags, setTagFileID, setTagFileMetaData} = tagsSlice.actions

export const getTags = (state: RootState) => state.tags.tags
export const getTagFileID = (state: RootState) => state.tags.tag_file_id
export const getTagFileMetadata = (state: RootState) => state.tags.tag_file_metadata

const getTagID = (state: RootState, id: TagID) => id
export const getTagByID = createSelector(
  [getTags, getTagID],
  (tags: TagList, tagId: TagID) => tags[tagId]
)



export default tagsSlice.reducer
