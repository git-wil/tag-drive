import { configureStore } from "@reduxjs/toolkit";
// import filesReducer from './slice_files_old.ts'
// import tagsReducer from './slice_tags_old.ts'
import filesReducer from "./slice_files.ts";
import tagsReducer from "./slice_tags.ts";
import homeReducer from "./slice_home.ts";
import editorReducer from "./slice_editor.ts";
import spreadsheetReducer from "./slice_spreadsheet.ts";

export const store = configureStore({
    reducer: {
        // Add reducers here
        files: filesReducer,
        tags: tagsReducer,
        home: homeReducer,
        editor: editorReducer,
        spreadsheet: spreadsheetReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
