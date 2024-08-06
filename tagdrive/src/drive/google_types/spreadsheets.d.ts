export type Spreadsheet = {
    spreadsheetID: string,
    properties: SpreadsheetProperties,
    sheets: Sheet[],
    namedRanges: NamedRange[],
    spreadsheetUrl: string,
    developerMetadata: DeveloperMetadata[],
    dataSources: DataSource[],
    dataSourceSchedules: DataSourceRefreshSchedule[]
}


export type GridProperties = {
    rowCount: number,
    columnCount: number,
    frozenRowCount: number,
    frozenColumnCount: number,
    hideGridlines: boolean,
    rowGroupControlAfter: boolean,
    columnGroupControlAfter: boolean
}

export type SheetProperties = {
    sheetId?: number,
    title?: string,
    index?: number,
    sheetType?: "SHEET_TYPE_UNSPECIFIED" | "GRID" | "OBJECT" | "DATA_SOURCE ",
    gridProperties?: GridProperties,
    hidden?: boolean,
    tabColorStyle?: unknown
    rightToLeft?: boolean,
    dataSourceSheetProperties?: unknown
}

namespace UpdateRequests {
    export type addSheetRequest = {
        properties: SheetProperties
    }
    export type deleteSheetRequest = {
        sheetId: number
    }
    export type addNamedRangeRequest = {
        namedRange: NamedRange
    }
    export type deleteNamedRangeRequest = {
        namedRangeId: string
    }
    export type deleteDimensionRequest = {
        range: DimensionRange
    }
}

export type UpdateRequest = {
    [key: "addSheet" |
        "deleteSheet" |
        "addNamedRange" |
        "deleteNamedRange" |
        "deleteDimension"
    ]: UpdateRequests.addSheetRequest |
    UpdateRequests.deleteSheetRequest |
    UpdateRequests.addNamedRangeRequest |
    UpdateRequests.deleteNamedRangeRequest |
    UpdateRequest.deleteDimensionRequest;
}

export type batchUpdateRequestBody = {
    requests: UpdateRequest[],
    includeSpreadsheetInResponse?: boolean,
    responseRanges?: string[],
    responseIncludeGridData?: boolean,
}

export type batchUpdateResponseBody = {
    spreadsheetId: string,
    replies: unknown[],
    updatedSpreadsheet: Spreadsheet
}

export type GridRange = {
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number
}

export type NamedRange = { 
    namedRangeId: string,
    name: string,
    range: GridRange
}

enum Dimension {
    DIMENSION_UNSPECIFIED = "DIMENSION_UNSPECIFIED",
    ROWS = "ROWS",
    COLUMNS = "COLUMNS"
}

export type DimensionRange = {
    sheetId: number,
    dimension: Dimension,
    startIndex: number, // inclusive
    endIndex: number // exclusive
}

export type ValueRange = {
    range: string,
    majorDimension: Dimension,
    values: string[][]
}


export namespace values {
    export type batchUpdateRequestBody = {
        valueInputOption: "INPUT_VALUE_OPTION_UNSPECIFIED" | "RAW" | "USER_ENTERED",
        data: ValueRange[],
    }

    export type getRequestBody = {
        majorDimension: Dimension,
    }
    export type getResponseBody = ValueRange;
    
    export type appendRequestBody = {
        valueInputOption: "INPUT_VALUE_OPTION_UNSPECIFIED" | "RAW" | "USER_ENTERED";
        insertDataOption: "OVERWRITE" | "INSERT_ROWS";
    }
}

// spreadsheets batchUpdate
//    addSheet
//    addNamedRange
//    deleteNamedRange
//    deleteDimension

// spreadsheets.values batchUpdate
// spreadsheets.values get
// spreadsheets.values append