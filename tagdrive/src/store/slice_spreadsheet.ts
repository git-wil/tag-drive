import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store.js';
import { Spreadsheet } from '../drive/google_types/spreadsheets.js';

const spreadsheetSlice = createSlice({
    name: 'spreadsheet',
    initialState: {
        spreadsheetId: "",
        spreadsheet: {} as Spreadsheet,
    },
    reducers: {
        setSpreadsheetId: (state, action: PayloadAction<string>) => {
            state.spreadsheetId = action.payload;
        },
        setSpreadsheet: (state, action: PayloadAction<Spreadsheet>) => {
            state.spreadsheet = action.payload;
        },
    },
})

export const {
    setSpreadsheetId,
    setSpreadsheet
} = spreadsheetSlice.actions

export const getSpreadsheetId = (state: RootState) => state.spreadsheet.spreadsheetId
export const getSpreadsheet = (state: RootState) => state.spreadsheet.spreadsheet

export default spreadsheetSlice.reducer
