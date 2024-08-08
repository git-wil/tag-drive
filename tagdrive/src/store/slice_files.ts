import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { GoogleFile } from '../drive/google_types';

const initial_files: GoogleFile[] = Array(30).fill(null as GoogleFile | null)

export const filesSlice = createSlice({
  name: 'files',
  initialState: {
    authorized: false,
    files: initial_files,
    files_loaded: false,
    queried_files: initial_files,
    visible_files: 30,
    standard_visible_files: 30,
    selected_files: [] as number[],
    dragging: {type: "", id: ""},
    dragged_over: [] as number[],
    loading_modal: {
      open: true,
      message: "Loading..."
    }
  },
  reducers: {
    setAuthorized: (state, action) => {
      state.authorized = action.payload;
    },
    setFiles: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      console.log("Setting files", action.payload)
      state.files = action.payload;
    },
    setFilesLoaded: (state, action) => {
      state.files_loaded = action.payload;
    },
    setVisibleFiles: (state, action) => {
      state.visible_files = Math.min(action.payload, state.queried_files.length);
    },
    setQueriedFiles: (state, action) => {
      state.queried_files = action.payload;
      state.visible_files = Math.min(state.standard_visible_files, action.payload.length)
    },
    setSelectedFiles: (state, action) => {
      state.selected_files = action.payload;
    },
    clearSelectedFiles: (state) => {
      state.selected_files = []
    },
    appendSelectedFile: (state, action) => {
      const index = action.payload;
      if (state.selected_files.includes(index)) {
        state.selected_files.splice(state.selected_files.indexOf(index), 1)
      }
      state.selected_files.push(index)
    },
    appendSelectedFilesBetween: (state, action) => {
      const [start, end] = action.payload
      if (start > end) {
        for (let index = start; index >= end; index--) {
          if (state.selected_files.includes(index)) {
            state.selected_files.splice(state.selected_files.indexOf(index), 1)
          }
          state.selected_files.push(index)
        }
      } else {
        for (let index = start; index <= end; index++) {
          if (state.selected_files.includes(index)) {
            state.selected_files.splice(state.selected_files.indexOf(index), 1)
          }
          state.selected_files.push(index)
        }
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
    },
    removeDraggedOver: (state, action) => {
      state.dragged_over = state.dragged_over.filter((index) => index !== action.payload)
    },
    setDragging: (state, action) => {
      state.dragging = action.payload
    },
    resetDragging: (state) => {
      state.dragging = {type: "", id: ""}
    },
    setLoadingModal: (state, action) => {
      state.loading_modal = action.payload
    }
  }
})

export const {
  setAuthorized,
  setFiles,
  setFilesLoaded,
  setSelectedFiles,
  setVisibleFiles,
  setQueriedFiles,
  clearSelectedFiles,
  appendSelectedFile,
  appendSelectedFilesBetween,
  removeSelectedFile,
  toggleSelectedFile,
  setDraggedOver,
  resetDraggedOver,
  removeDraggedOver,
  setDragging,
  resetDragging,
  setLoadingModal,
} = filesSlice.actions
export const isAuthorized = (state: RootState) => state.files.authorized
export const getFiles = (state: RootState) => state.files.files
export const getFilesLoaded = (state: RootState) => state.files.files_loaded
export const getVisibleFiles = (state: RootState) => state.files.visible_files
export const getQueriedFiles = (state: RootState) => state.files.queried_files
export const getSelectedFiles = (state: RootState) => state.files.selected_files
export const isSelectedFile = (index: number) => ((state: RootState) => state.files.selected_files.includes(index))
export const getDraggedOver = (state: RootState) => state.files.dragged_over
export const getDragging = (state: RootState) => state.files.dragging
export const getLoadingModal = (state: RootState) => state.files.loading_modal

export default filesSlice.reducer
