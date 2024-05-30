import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store';
import { GoogleFile } from './google_types'

const initial_files: GoogleFile[] = Array(30).fill(null as GoogleFile | null)

export const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: initial_files,
    files_loaded: false,
    selected_file: null as GoogleFile | null,
  },
  reducers: {
    setFiles: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.files = action.payload;
    },
    setFilesLoaded: (state, action) => {
      state.files_loaded = action.payload;
    },
    setSelectedFile: (state, action) => {
      state.selected_file = action.payload;
    },
  }
})

export const { setFiles, setFilesLoaded, setSelectedFile } = filesSlice.actions
export const getFiles = (state: RootState) => state.files.files
export const getFilesLoaded = (state: RootState) => state.files.files_loaded
export const getSelectedFile = (state: RootState) => state.files.selected_file

export default filesSlice.reducer
