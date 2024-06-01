import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store/store';
import { GoogleFile } from './google_types'
import { toggle } from '@nextui-org/react';

const initial_files: GoogleFile[] = Array(30).fill(null as GoogleFile | null)

export const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: initial_files,
    files_loaded: false,
    selected_file: null as GoogleFile | null,
    selected_files: [] as number[],
    dragged_over: [] as number[],
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
    setSelectedFiles: (state, action) => {
      state.selected_files = action.payload;
    },
    clearSelectedFiles: (state) => {
      state.selected_files = []
    },
    appendSelectedFile: (state, action) => {
      if (!state.selected_files.includes(action.payload)) {
        state.selected_files.push(action.payload)
      }
    },
    removeSelectedFile: (state, action) => {
      // By index
      state.selected_files = state.selected_files.splice(action.payload, 1)
    },
    toggleSelectedFile: (state, action) => {
      const index = state.selected_files.indexOf(action.payload)
      if (index === -1) {
        state.selected_files.push(action.payload)
      } else {
        state.selected_files.splice(index, 1)
      }
    },
    setDraggedOver: (state, action) => {
      state.dragged_over = action.payload
    },
    resetDraggedOver: (state) => {
      state.dragged_over = []
    }
  }
})

export const {
  setFiles,
  setFilesLoaded,
  setSelectedFile,
  setSelectedFiles,
  clearSelectedFiles,
  appendSelectedFile,
  removeSelectedFile,
  toggleSelectedFile,
  setDraggedOver,
  resetDraggedOver,
} = filesSlice.actions
export const getFiles = (state: RootState) => state.files.files
export const getFilesLoaded = (state: RootState) => state.files.files_loaded
export const getSelectedFile = (state: RootState) => state.files.selected_file
export const getSelectedFiles = (state: RootState) => state.files.selected_files
export const isSelectedFile = (index: number) => ((state: RootState) => state.files.selected_files.includes(index))
export const getDraggedOver = (state: RootState) => state.files.dragged_over

export default filesSlice.reducer
