import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store.js";
import { GoogleFile } from "../drive/google_types.js";

const editorSlice = createSlice({
    name: "editor",
    initialState: {
        // The state for the main page progress bar
        progress: {
            steps: 0, // If 0, no progress bar is shown
            current: 0,
            message: "",
        },
        // The list of files in the user's Google Drive
        drive_files: Array(30).fill(null) as GoogleFile[],
        // The currently queried files
        queried_files: Array(30).fill(null) as GoogleFile[],
        // The number of files to display
        visible_files: {
            standard: 30,
            current: 30,
            increment: 30,
        },
        // The currently selected files by index
        selected_files: [] as number[],
    },
    reducers: {
        // Progress bar actions
        initializeProgress: (
            state,
            action: PayloadAction<{ steps: number; message: string }>,
        ) => {
            state.progress.steps = action.payload.steps;
            state.progress.current = 0;
            state.progress.message = action.payload.message;
        },
        updateProgress: (
            state,
            action: PayloadAction<{ step: number; message: string }>,
        ) => {
            state.progress.current = action.payload.step;
            state.progress.message = action.payload.message;
        },
        clearProgress: (state) => {
            state.progress.steps = 0;
            state.progress.current = 0;
            state.progress.message = "";
        },
        // Google Drive file actions
        setDriveFiles: (state, action: PayloadAction<GoogleFile[]>) => {
            state.drive_files = action.payload;
        },
        // Query file actions
        setQueriedFiles: (state, action: PayloadAction<GoogleFile[]>) => {
            state.queried_files = action.payload;
            // Reset the visible files to the standard amount
            state.visible_files.current = Math.min(
                state.visible_files.standard,
                action.payload.length,
            );
        },
        queryAllFiles: (state) => {
            // Set the queried files to the drive files
            state.queried_files = state.drive_files;
            // Reset the visible files to the standard amount
            state.visible_files.current = Math.min(
                state.visible_files.standard,
                state.drive_files.length,
            );
        },
        setVisibleFileCount: (state, action: PayloadAction<number>) => {
            // Set the number of visible files to the minimum of the action payload and the queried files length
            state.visible_files.current = Math.min(
                action.payload,
                state.queried_files.length,
            );
        },
        incrementVisibleFileCount: (state) => {
            // Increment the number of visible files by the increment amount, up to the queried files length
            state.visible_files.current = Math.min(
                state.visible_files.current + state.visible_files.increment,
                state.queried_files.length,
            );
        },
        // Selected file actions
        setSelectedFileIndices: (state, action: PayloadAction<number[]>) => {
            state.selected_files = action.payload;
        },
        clearSelectedFileIndices: (state) => {
            state.selected_files = [];
        },
        appendSelectedFileIndex: (state, action: PayloadAction<number>) => {
            const index = action.payload;
            // If the file is already selected, re-add it to the end of the list
            if (state.selected_files.includes(index)) {
                state.selected_files.splice(
                    state.selected_files.indexOf(index),
                    1,
                );
            }
            state.selected_files.push(index);
        },
        appendSelectedFileIndicesBetween: (
            state,
            action: PayloadAction<{ start_index: number; end_index: number }>,
        ) => {
            const start_index = action.payload.start_index;
            const end_index = action.payload.end_index;
            if (start_index > end_index) {
                // If the start index is greater than the end index, iterate backwards
                for (let index = start_index; index >= end_index; index--) {
                    // If the file is already selected, re-add it to the end of the list
                    if (state.selected_files.includes(index)) {
                        state.selected_files.splice(
                            state.selected_files.indexOf(index),
                            1,
                        );
                    }
                    state.selected_files.push(index);
                }
            } else {
                for (let index = start_index; index <= end_index; index++) {
                    // If the file is already selected, re-add it to the end of the list
                    if (state.selected_files.includes(index)) {
                        state.selected_files.splice(
                            state.selected_files.indexOf(index),
                            1,
                        );
                    }
                    state.selected_files.push(index);
                }
            }
        },
        removeSelectedFileIndex: (state, action: PayloadAction<number>) => {
            // Remove the file by index
            state.selected_files = state.selected_files.splice(
                action.payload,
                1,
            );
        },
        toggleSelectedFileIndex: (state, action: PayloadAction<number>) => {
            // If the file is not selected, add it to the list, otherwise remove it
            const index = state.selected_files.indexOf(action.payload);
            if (index === -1) {
                state.selected_files.push(action.payload);
            } else {
                state.selected_files.splice(index, 1);
            }
        },
    },
});

export const {
    // Progress bar action exports
    initializeProgress,
    updateProgress,
    clearProgress,
    // Google Drive file action exports
    setDriveFiles,
    // Query file action exports
    setQueriedFiles,
    queryAllFiles,
    setVisibleFileCount,
    incrementVisibleFileCount,
    // Selected file action exports
    setSelectedFileIndices,
    clearSelectedFileIndices,
    appendSelectedFileIndex,
    appendSelectedFileIndicesBetween,
    removeSelectedFileIndex,
    toggleSelectedFileIndex,
} = editorSlice.actions;

// Progress bar selectors
export const getProgress = (state: RootState) => state.editor.progress;
// Google Drive file selectors
export const getDriveFiles = (state: RootState) => state.editor.drive_files;
export const areDriveFilesLoaded = (state: RootState) => {
    return (
        state.editor.drive_files.length > 0 &&
        state.editor.drive_files[0] !== null
    );
};
// Query file selectors
export const getQueriedFiles = (state: RootState) => {
    return state.editor.queried_files;
};
export const getQueriedFileByIndex = (index: number) => (state: RootState) => {
    return state.editor.queried_files[index];
};
export const getVisibleFileCount = (state: RootState) => {
    return state.editor.visible_files.current;
};
// Selected file selectors
export const getSelectedFileIndices = (state: RootState) => {
    return state.editor.selected_files;
};
export const isFileIndexSelected = (index: number) => (state: RootState) => {
    return state.editor.selected_files.includes(index);
};

/**
 * Check if there are any modifications in the file or tag modification queues
 * @param state The global state
 * @returns A boolean indicating if there are any modifications
 */
export const isModified = (state: RootState): boolean => {
    return (
        state.tags.tag_mod_queue.length > 0 ||
        state.files.file_mod_queue.length > 0
    );
};

export default editorSlice.reducer;
