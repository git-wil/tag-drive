import { createSelector, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store.js';
import { tag_colors } from "../../tailwind.config.js";
import { Tag, TagID, TagList } from "./tag_types.js";
import { GoogleFile } from '../drive/google_types.js';


const allowed_colors = tag_colors;


const temp_tags: TagList = {
    "0": {
        color: "amber-700",
        name: "Tag0",
        aliases: [],
        children: [],
        files: ["File0"]
    },
    "1":{
        color: "lime-700",
        name: "Second Tag",
        aliases: [],
        children: [],
        files: ["File0"]
    },
    "2":{
        color: "blue-800",
        name: "Tag2123123",
        aliases: [],
        children: [],
        files: ["File0"]
    }
}


export const tagsSlice = createSlice({
  name: 'tags',
  initialState: {
    tags: temp_tags as TagList,
    tag_file_id: "",
    tag_file_metadata: {} as GoogleFile
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

export const { setTags, setTagFileID, setTagFileMetaData } = tagsSlice.actions

export const getTags = (state: RootState) => state.tags.tags
export const getTagFileID = (state: RootState) => state.tags.tag_file_id
export const getTagFileMetadata = (state: RootState) => state.tags.tag_file_metadata

const getTagID = (state: RootState, id: TagID) => id
export const getTagByID = createSelector(
  [getTags, getTagID],
  (tags: TagList, tagId: TagID) => tags[tagId]
)



export default tagsSlice.reducer
