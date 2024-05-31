import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store.js';
import { TagID, } from "./tag_types.js";


export const typedTagsSlice = createSlice({
  name: 'typedTags',
  initialState: {
    typed_tags: [] as TagID[],
    value: "",
  },
  reducers: {
    setTypedTags: (state, action) => {
      state.typed_tags = action.payload;
    },
    setValue: (state, action) => {
        state.value = action.payload;
    },
  },
})

export const { setTypedTags, setValue } = typedTagsSlice.actions

export const getTypedTags = (state: RootState) => state.typedTags.typed_tags
export const getValue = (state: RootState) => state.typedTags.value



export default typedTagsSlice.reducer
