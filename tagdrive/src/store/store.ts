import { configureStore } from '@reduxjs/toolkit'
import filesReducer from '../drive/files_slice'
import tagsReducer from '../tag/tags_slice'
import typedTagsReducer from '../tag/tag_search_slice'

export const store = configureStore({
    reducer: {
        // Add reducers here
        files: filesReducer,
        tags: tagsReducer,
        typedTags: typedTagsReducer,
        // selectedFile:
    }
  })
  
  // Infer the `RootState` and `AppDispatch` types from the store itself
  export type RootState = ReturnType<typeof store.getState>
  // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
  export type AppDispatch = typeof store.dispatch