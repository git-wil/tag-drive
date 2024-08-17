import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store.js';
import { GoogleDrive } from '../drive/google_types.js';

/**
 * Create a slice for the home page, located at App.tsx
 * This slice will contain the state of the home page, including whether
 * the user is authorized and the list of loaded GoogleDrives.
 */
const homeSlice = createSlice({
    name: 'home',
    initialState: {
        authorized: false,
        drives: [] as GoogleDrive[],
    },
    reducers: {
        setAuthorized: (state, action: PayloadAction<boolean>) => {
            state.authorized = action.payload;
        },
        setDrives: (state, action: PayloadAction<GoogleDrive[]>) => {
            state.drives = action.payload;
        },
    },
})

export const {
    setAuthorized,
    setDrives,
} = homeSlice.actions

export const isAuthorized = (state: RootState) => state.home.authorized
export const getDrives = (state: RootState) => state.home.drives

export default homeSlice.reducer