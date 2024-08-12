export type Spreadsheet = {
    spreadsheetId: string,
    properties: SpreadsheetProperties,
    sheets: Sheet[],
    namedRanges: NamedRange[],
    spreadsheetUrl: string,
    developerMetadata: DeveloperMetadata[],
    dataSources: DataSource[],
    dataSourceSchedules: DataSourceRefreshSchedule[]
}

export type Sheet = {
    properties: SheetProperties,
    data: GridData[],
    merges: GridRange[],
    conditionalFormats: ConditionalFormat[],
    filterViews: FilterView[],
    protectedRanges: ProtectedRange[],
    basicFilter: BasicFilter,
    charts: EmbeddedChart[],
    bandedRanges: BandedRange[],
    developerMetadata: DeveloperMetadata[],
    rowGroups: RowGroup[],
    columnGroups: ColumnGroup[],
    slicers: Slicer[],
}

export type GridData = {
    startRow: number,
    startColumn: number,
    rowData: RowData[]
    rowMetadata: RowMetadata[]
    columnMetadata: ColumnMetadata[]
}

export type RowData = {
    values: CellData[]
}

export type ParsedSpreadsheetValues = {
    [sheet_id: number]: {
        [query_id: number]: {
            [row_id: number]: string[], // values
        }
    }
}

export type CellData = {
    formattedValue: string, // The only field that matters
    userEnteredValue: ExtendedValue,
    effectiveValue: ExtendedValue,
    userEnteredFormat?: CellFormat,
    effectiveFormat?: CellFormat,
    hyperlink?: string,
    note?: string,
    textFormatRuns?: TextFormatRun[],
    dataValidation?: DataValidationRule,
    pivotTable?: PivotTable,
    dataSourceTable?: DataSourceTable,
    dataSourceFormula?: DataSourceFormula,
}

export type ExtendedValue = {
    stringValue?: string,
    numberValue?: number,
    boolValue?: boolean,
    formulaValue?: string,
    errorValue?: ErrorValue,
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

export namespace UpdateRequests {
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
    export type appendDimensionRequest = {
        sheetId: number,
        dimension: Dimension,
        length: number
    }
    export type appendCellsRequest = {
        sheetId: number,
        rows: RowData[],
        fields: string
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

export type getSpreadsheetQuery = {
    includeGridData: boolean
    ranges?: string[],
}

export type GridRange = {
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number
}

export type NamedRange = { 
    namedRangeId?: string,
    name: string,
    range: GridRange
}

export type Dimension = "DIMENSION_UNSPECIFIED" | "ROWS" | "COLUMNS";

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

export type UpdateValuesResponse = {
    spreadsheetId: string,
    updatedRange: string,
    updatedRows: number,
    updatedColumns: number,
    updatedCells: number,
    updatedData: ValueRange
}


export namespace values {
    export type batchUpdateRequestBody = {
        valueInputOption: "INPUT_VALUE_OPTION_UNSPECIFIED" | "RAW" | "USER_ENTERED",
        data: ValueRange[],
    }

    export type batchUpdateResponseBody = {
        spreadsheetId: string,
        totalUpdatedCells: number,
        totalUpdatedColumns: number,
        totalUpdatedRows: number,
        totalUpdatedSheets: number,
        responses: UpdateValuesResponse[]
    }

    export type getRequestBody = {
        majorDimension: Dimension,
    }
    export type getResponseBody = ValueRange;

    export type batchGetQuery = {
        ranges: string[],
        majorDimension: Dimension,
    }

    export type batchGetResponseBody = {
        spreadsheetId: string,
        valueRanges: ValueRange[]
    }
    
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

export type GenericTagOperatorData = {
    // Could be TagList or FileTagData
    [id: string]: {
        [value: string]: string | string[]
    }
}