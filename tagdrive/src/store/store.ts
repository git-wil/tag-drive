import { configureStore } from '@reduxjs/toolkit'
import filesReducer from './slice_files.ts'
import tagsReducer from './slice_tags.ts'

export const store = configureStore({
    reducer: {
        // Add reducers here
        files: filesReducer,
        tags: tagsReducer,
    }
  })
  
  // Infer the `RootState` and `AppDispatch` types from the store itself
  export type RootState = ReturnType<typeof store.getState>
  // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
  export type AppDispatch = typeof store.dispatch