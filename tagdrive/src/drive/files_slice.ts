import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store';
import { GoogleFile } from './google_types'

const initial_files: GoogleFile[] = Array(30).fill(null as GoogleFile | null)

export const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: initial_files
  },
  reducers: {
    setFiles: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.files = action.payload;
    },
  },
})

export const { setFiles } = filesSlice.actions
export const getFiles = (state: RootState) => state.files.files


export default filesSlice.reducer
