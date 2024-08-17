import google_modular from "./google_modular";
import {
    DriveListResponse,
    FileListResponse,
    GoogleFileModifier,
    GoogleFile,
} from "./google_types";
import { TAG_FILE_NAME } from "../assets/constants";
import {
    batchUpdateResponseBody,
    NamedRange,
    ParsedSpreadsheetValues,
    RowData,
    Sheet,
    Spreadsheet,
    UpdateRequest,
    ValueRange,
    values,
} from "./google_types/spreadsheets";
import {
    TagID,
    TagList,
    TagModification,
    TagModificationType,
} from "../tag/tag_types";
import {
    FileID,
    FileList,
    FileModification,
    FileModificationType,
} from "../file/file_types";

export const ALLOWED_MIME_TYPES = [
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.spreadsheet",
    "application/vnd.google-apps.presentation",
    "application/vnd.google-apps.form",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/pdf",
    "application/rtf",
    "text/csv",
    "audio/mpeg",
    "audio/aac",
    "audio/wav",
    "image/png",
    "image/jpeg",
    "image/bmp",
    "image/heif",
    "image/gif",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-matroska",
];

const ALLOWED_MIME_TYPES_STRING =
    "((mimeType = '" + ALLOWED_MIME_TYPES.join("') or (mimeType = '") + "'))";

export const MIME_TYPE_TO_NAME: { [id: string]: string } = {
    "application/vnd.google-apps.document": "Document",
    "application/vnd.google-apps.spreadsheet": "Spreadsheet",
    "application/vnd.google-apps.presentation": "Slideshow",
    "application/vnd.google-apps.form": "Form",
    "application/msword": "Word Doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Word",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Excel",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "Powerpoint",
    "application/pdf": "PDF",
    "application/rtf": "RTF",
    "text/csv": "CSV",
    "audio/mpeg": "MP3",
    "audio/aac": "AAC",
    "audio/wav": "WAV",
    "image/png": "PNG",
    "image/jpeg": "JPG/JPEG",
    "image/bmp": "BMP",
    "image/heif": "HEIF/HEIC",
    "image/gif": "GIF",
    "video/x-msvideo": "AVI",
    "video/quicktime": "MOV",
    "video/x-matroska": "MKV",
};

export async function get_drive_list(): Promise<DriveListResponse> {
    return google_modular.drives.list({
        pageSize: 100,
        fields: "drives(id, name, colorRgb)",
        orderBy: "name, recency desc",
    });
}

export async function get_file_list(
    drive_id: string,
    get_file_progress_hook: (thousands_of_files_processed: number) => void,
): Promise<GoogleFile[]> {
    let response: FileListResponse;
    let files: GoogleFile[] = [];
    let pageToken: string | undefined = undefined;
    let thousands_of_files_processed = 0;
    do {
        // Get 1000 files from the selected drive
        try {
            response = await google_modular.files.list({
                corpora: drive_id == "" ? "user" : "drive",
                driveId: drive_id,
                pageSize: 1000, // Update to use pagination later
                q: `trashed=false and name!='${TAG_FILE_NAME}' and ${ALLOWED_MIME_TYPES_STRING}`,
                fields: "files(id, name, mimeType, webViewLink, hasThumbnail, thumbnailLink, iconLink, driveId, parents), nextPageToken",
                supportsAllDrives: true,
                includeItemsFromAllDrives: drive_id != "",
                orderBy: "recency desc", // TODO: decide if we want to sort by recency or name
                pageToken: pageToken || "",
            });
        } catch (err) {
            console.log(err);
            alert(
                "Error getting files from Google Drive. Please try again later.",
            );
            return [];
        }
        // Update the list of files
        if (!files) {
            files = response.files;
        } else {
            files.push(...response.files);
        }
        // Update the page token
        pageToken = response.nextPageToken;
        // Update the progress
        thousands_of_files_processed += 1;
        get_file_progress_hook(thousands_of_files_processed);
    } while (pageToken);
    return files;
    // return google_modular.files.list({
    //     corpora: drive_id == "" ? "user" : "drive",
    //     driveId: drive_id,
    //     pageSize: 30, // Update to use pagination later
    //     q: `trashed=false and name!='${TAG_FILE_NAME}' and ${ALLOWED_MIME_TYPES_STRING}`,
    //     fields: "files(id, name, mimeType, webViewLink, hasThumbnail, thumbnailLink, iconLink, driveId)",
    //     supportsAllDrives: true,
    //     includeItemsFromAllDrives: drive_id != "",
    //     orderBy: "recency desc", // TODO: decide if we want to sort by recency or name
    // })
}

/**
 * Create a new TagOperator spreadsheet in the user's drive or a specific shared drive.
 * The spreadsheet will have two sheets: Tags and Files, with appropriate headers for
 * the data stored about tags and files.
 * @param drive_id The drive id to create the TagOperator spreadsheet in. If empty, create in the user's drive.
 * @returns The id of the newly created TagOperator spreadsheet.
 */
export async function create_tag_sheet(drive_id: string): Promise<string> {
    console.log("Creating tag sheet");
    const fileMetadata: GoogleFileModifier = {
        name: TAG_FILE_NAME,
        parents: [drive_id || "root"],
        mimeType: "application/vnd.google-apps.spreadsheet",
        appProperties: {
            "tag-operator-version": "1.0.0",
        },
    };
    const tag_sheet = await google_modular.files.create_no_content(
        fileMetadata,
        {
            supportsAllDrives: true,
        },
    );
    const spreadsheetId = tag_sheet.id;

    // Create spreadsheet with 2 sheets: Tags and Files
    await google_modular.spreadsheets.batchUpdate(spreadsheetId, {
        requests: [
            // Create the Tags sheet
            {
                addSheet: {
                    properties: {
                        title: "Tags",
                    },
                },
            },
            // Create the Files sheet
            {
                addSheet: {
                    properties: {
                        title: "Files",
                    },
                },
            },
            // Delete the default first sheet
            {
                deleteSheet: {
                    sheetId: 0,
                },
            },
        ],
    });
    // Initialize the Tags and Files sheets with header values
    const inintialize_tags_header = value_range_factory("Tags!A1:G1", [
        ["ID", "Name", "Color", "Icon", "Aliases", "Child IDs", "Parent ID"],
    ]);
    const inintialize_files_header = value_range_factory("Files!A1:D1", [
        ["ID", "Google ID", "Tag IDs", "Search String"],
    ]);

    update_raw_sheet_values(spreadsheetId, [
        inintialize_tags_header,
        inintialize_files_header,
    ]).then((result) => {
        console.log("Initialized tag sheet with values", result);
    });

    return spreadsheetId;
}

/**
 * Get the id of the TagOperator spreadsheet in the user's drive or a specific shared drive.
 * If the TagOperator spreadsheet does not exist, this function will create a new one and
 * initialize it the Tags and Files sheets with appropriate headers.
 * @param drive_id The drive id to search for the tag file in. If empty, search in the user's drive.
 * @returns The id of the existing TagOperator spreadsheet, or the id of a newly created spreadsheet.
 */
export async function get_tag_sheet_id(
    drive_id: string,
    create_file_hook?: () => void,
): Promise<string> {
    // Parameters to search for the tag file
    const params = {
        corpora: drive_id == "" ? "user" : "drive",
        driveId: drive_id,
        pageSize: 1,
        q: `name='${TAG_FILE_NAME}' and trashed=false and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: "files(*)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: drive_id != "",
    };

    const result = await google_modular.files.list(params);
    const files = result.files;
    // Tag file exists
    if (files.length > 0) {
        return result.files[0].id;
        // Tag file does not exist, so create it
    } else {
        if (create_file_hook) {
            create_file_hook();
        }
        return await create_tag_sheet(drive_id);
    }
}

/**
 *  Get the metadata of the TagOperator spreadsheet, such as properties.
 * @param spreadsheetId The id of the TagOperator spreadsheet
 * @returns The spreadsheet object containing only metadata.
 */
export async function get_tag_sheet_metadata(
    spreadsheetId: string,
): Promise<Spreadsheet> {
    return google_modular.spreadsheets.get(spreadsheetId, {
        includeGridData: false,
    });
}

/**
 * Get the relevant spreadsheet data from the TagOperator spreadsheet, including the Tags and Files sheets.
 * @param spreadsheetId The id of the TagOperator spreadsheet
 * @returns The spreadsheet object containing metadata and the data from the Tags and Files sheets.
 */
export async function get_tag_sheet_data(
    spreadsheetId: string,
): Promise<Spreadsheet> {
    // Get all the data from the tag sheet
    // The first row is the header, which has the column names
    // ID	      Name	    Color	       Aliases	Child IDs   Parent ID   [for Tags]
    // or
    // Google ID  Tag IDs	Search String                                   [for Files]
    // All following rows have the tag and file data
    return google_modular.spreadsheets.get(spreadsheetId, {
        ranges: ["Tags!A1:G", "Files!A1:D"],
        includeGridData: true,
    });
    // For some reason, batchGet gives me a cors error
    // return await google_modular.spreadsheets.values.batchGet(spreadsheetId, {
    //     ranges: ["Tags!A1:F", "Files!A1:C"],
    //     majorDimension: "ROWS",
    // });
}

/**
 * Parse the values from a spreadsheet object into a more usable format.
 * The spreadsheet object should be the result of a spreadsheets.get request
 * with includeGridData set to true and query ranges provided.
 * @param spreadsheet The spreadsheet object to parse values from
 * @returns An object containing the parsed values from the spreadsheet, organized by sheet, query range, and row.
 */
export function parse_values_from_spreadsheet(
    spreadsheet: Spreadsheet,
): ParsedSpreadsheetValues {
    const data: ParsedSpreadsheetValues = {};
    if (!spreadsheet.sheets) {
        return data;
    }
    // For each sheet in the spreadsheet
    for (const [sheet_index, sheet] of spreadsheet.sheets.entries()) {
        data[sheet_index] = {};
        // For each query range present in the sheet
        for (const [query_index, queryBlock] of sheet.data.entries()) {
            if (!queryBlock || !queryBlock.rowData) {
                continue;
            }
            data[sheet_index][query_index] = {};
            // For each row in the query range
            for (const [row_index, row] of queryBlock.rowData.entries()) {
                // If the row has no values, skip it
                if (!row.values) {
                    continue;
                }
                // Get the formatted value of the cell, or the effective value if the formatted value is not present
                // If neither are present, use an empty string
                const values: string[] = row.values.map(
                    (cell) =>
                        cell.formattedValue ||
                        cell.effectiveValue?.stringValue ||
                        "",
                );
                data[sheet_index][query_index][row_index] = values;
            }
        }
    }
    return data;
}

/**
 * Parse the tag data from the values in the Tags sheet of the TagOperator spreadsheet.
 * @param sheetData The parsed data from the TagOperator spreadsheet
 * @returns The TagList object associating tag ids to their tag information.
 */
export function parse_tag_data_from_sheet_values(
    sheetData: ParsedSpreadsheetValues,
): TagList {
    // Parse the data into Tag format
    const tags: TagList = {};
    // Tag data is stored in the first sheet
    if (!sheetData[0] || !sheetData[0][0]) {
        return tags;
    }
    for (const [row_index, row] of Object.entries(sheetData[0][0])) {
        // Skip the header row
        if (row_index === "0") {
            continue;
        }
        // Parse the tag out of the row
        const [id, name, color, icon, aliases, child_ids, parent_id] = row;
        // Skip items without an id, should not exist unless it's an empty row
        if (!id) {
            continue;
        }
        tags[id] = {
            id: id || "",
            name: name || "",
            color: color || "",
            icon: icon || "",
            aliases: aliases ? aliases.split(",") : [],
            children: child_ids ? child_ids.split(",") : [],
            parent: parent_id || "",
        };
    }
    return tags;
}

/**
 * Parse the file data from the values in the Files sheet of the TagOperator spreadsheet.
 * @param sheetData The parsed data from the TagOperator spreadsheet
 * @returns The FileTagData object associating file ids to their tag ids and search strings.
 */
export function parse_file_data_from_sheet_values(
    sheetData: ParsedSpreadsheetValues,
): FileList {
    const files: FileList = {};
    // File data is stored in the second sheet
    if (!sheetData[1] || !sheetData[1][0]) {
        return files;
    }
    for (const [row_index, row] of Object.entries(sheetData[1][0])) {
        // Skip the header row
        if (row_index === "0") {
            continue;
        }
        // Parse the file out of the row
        const [sheet_id, google_id, tag_ids, search_string] = row;
        // Skip items without an id, should not exist unless it's an empty row
        if (!sheet_id || !google_id) {
            continue;
        }
        files[google_id] = {
            gid: google_id,
            sheet_id: sheet_id,
            tags: tag_ids ? tag_ids.split(",") : [],
            search_string: search_string || "",
        };
    }
    return files;
}

/**
 * Update the values in a spreadsheet with a list of value ranges.
 * The value ranges are updated in the order they are provided, and data is input as raw values.
 * @param spreadsheetId The id of the spreadsheet to update.
 * @param valueRanges The list of value ranges to update in the spreadsheet.
 * @returns
 */
export async function update_raw_sheet_values(
    spreadsheetId: string,
    valueRanges: ValueRange[],
) {
    return google_modular.spreadsheets.values.batchUpdate(spreadsheetId, {
        valueInputOption: "RAW",
        data: valueRanges,
    });
}

/**
 * Create a value range object for a specific range in a sheet by range and values.
 */
export function value_range_factory(
    range: string,
    values: string[][],
): ValueRange {
    return {
        range: range,
        majorDimension: "ROWS",
        values: values,
    };
}

/**
 * Create a named range object for a specific range in a sheet by sheet id and range indices.
 */
export function named_range_factory(
    sheetId: number,
    startRowIndex: number,
    endRowIndex: number,
    startColumnIndex: number,
    endColumnIndex: number,
    name: string,
): NamedRange {
    return {
        name: name,
        range: {
            sheetId: sheetId,
            startRowIndex: startRowIndex,
            endRowIndex: endRowIndex,
            startColumnIndex: startColumnIndex,
            endColumnIndex: endColumnIndex,
        },
    };
}

export function row_data_factory(values: string[]): RowData {
    // Only the values are needed for the row data
    return {
        values: values.map((value) => ({
            formattedValue: value,
            userEnteredValue: { stringValue: value },
            effectiveValue: { stringValue: value },
        })),
    };
}

export function append_cell_update_factory(
    sheetId: number,
    rowData: RowData[],
): UpdateRequest {
    return {
        appendCells: {
            sheetId: sheetId,
            rows: rowData,
            fields: "*",
        },
    };
}

/**
 * Append new named rows to a certain sheet in a spreadsheet. The given data values are added
 * to the end of the sheet and a named range is created for the each row based on name_index.
 * @param spreadsheet The existing Spreadsheet object
 * @param tags The list of tags to add to the spreadsheet
 * @returns The promise of the named range batch update response body
 */
export async function append_named_rows(
    spreadsheetId: string,
    sheet: Sheet,
    row_values: string[][],
    name_index: number,
): Promise<batchUpdateResponseBody> {
    if (!sheet.properties.sheetId) {
        throw Error(`Sheet ${sheet} does not have a valid sheetId!`);
    }
    // Get the sheet's id
    const sheetId = sheet.properties.sheetId;
    // Find the index of the last row in the sheet
    const table_end_index = sheet.data[0].rowData.length;
    // Create a list of batch updates to modify the spreadsheet
    const updates: UpdateRequest[] = [];

    // Create row data
    const row_data = row_values.map((row) => row_data_factory(row));
    // Append the new data rows to the sheet
    updates.push(append_cell_update_factory(sheetId, row_data));

    // Create addNamedRange updates to add named ranges for each piece of data
    for (const [index, row] of row_values.entries()) {
        const name = row[name_index];
        const row_length = row.length;
        updates.push({
            addNamedRange: {
                namedRange: named_range_factory(
                    sheetId,
                    table_end_index + index,
                    table_end_index + 1 + index,
                    0,
                    row_length,
                    name,
                ),
            },
        });
    }
    return google_modular.spreadsheets.batchUpdate(spreadsheetId, {
        requests: updates,
    });
}

/**
 * Update existing tags in the TagOperator spreadsheet. These tags must have been created
 * using create_tag_rows so that the rows will have named ranges by id.
 * @param spreadsheet The TagOperator spreadsheet id
 * @param tags The list of modified existing tags to update in the spreadsheet
 * @returns
 */
export async function update_named_rows(
    spreadsheetId: string,
    row_values: string[][],
    name_index: number,
): Promise<values.batchUpdateResponseBody> {
    // Create a list of value updates for each row using the name index as a named range
    const value_updates = row_values.map((row) =>
        value_range_factory(row[name_index], [row]),
    );
    return update_raw_sheet_values(spreadsheetId, value_updates);
}

/**
 * Delete named rows from a spreadsheet. This function assumes that the list of names
 * provided are valid named ranges in the spreadsheet and that the named ranges should
 * be deleted along with the entire row range that the named range covers.
 * @param spreadsheet The spreadsheet to delete named rows from
 * @param names The list of named row names to delete
 * @returns A batch update response body for the delete named range and delete dimension updates
 */
export async function delete_named_rows(
    spreadsheet: Spreadsheet,
    names: string[],
) {
    // Get the spreadsheet id of the Tags sheet
    const spreadsheetId = spreadsheet.spreadsheetId;
    // Find all the named ranges that need to be deleted
    const marked_named_ranges = spreadsheet.namedRanges.filter((named_range) =>
        names.includes(named_range.name),
    );
    // Sort the named ranges by their start row index, deleting the last row first
    marked_named_ranges.sort(
        (a, b) => b.range.startRowIndex - a.range.startRowIndex,
    );

    // Create a list delete named range updates for each named range
    const delete_named_ranges_updates = marked_named_ranges.map(
        (named_range) => {
            return {
                deleteNamedRange: {
                    namedRangeId: named_range.namedRangeId,
                },
            };
        },
    );

    // Create a list of delete dimension updates for the row ranges of the named ranges
    const delete_dimension_updates = marked_named_ranges.map((named_range) => {
        return {
            deleteDimension: {
                range: {
                    sheetId: named_range.range.sheetId,
                    dimension: "ROWS",
                    startIndex: named_range.range.startRowIndex,
                    endIndex: named_range.range.endRowIndex,
                },
            },
        };
    });

    // Batch update the spreadsheet with the delete named range and delete dimension updates
    return google_modular.spreadsheets.batchUpdate(spreadsheetId, {
        requests: [...delete_named_ranges_updates, ...delete_dimension_updates],
    });
}

export async function apply_tag_modifications(
    spreadsheet: Spreadsheet,
    tag_modifications: TagModification[],
) {
    //
    const simplified_mods = simplify_tag_mod_queue(tag_modifications);
    // Get the spreadsheet id of the TagOperator spreadsheet
    const spreadsheetId = spreadsheet.spreadsheetId;
    // Get the Tags sheet from the spreadsheet
    const tag_sheet = spreadsheet.sheets.find(
        (sheet) => sheet.properties.title === "Tags",
    );
    if (!tag_sheet) {
        throw Error("Tags sheet not found in spreadsheet" + spreadsheetId);
    }
    const TAG_ID_INDEX = 0;

    // Update existing tags in the TagOperator spreadsheet
    const update_mods = simplified_mods.filter(
        (mod) => mod.type === TagModificationType.UPDATE,
    );
    const update_data: string[][] = [];
    for (const mod of update_mods) {
        update_data.push([
            mod.tag.id,
            mod.tag.name,
            mod.tag.color,
            mod.tag.icon,
            mod.tag.aliases.join(","),
            mod.tag.children.join(","),
            mod.tag.parent,
        ]);
    }
    let update_response;
    if (Object.keys(update_data).length > 0) {
        console.log("Updating tags", update_data);
        update_response = update_named_rows(
            spreadsheetId,
            update_data,
            TAG_ID_INDEX,
        );
    }

    // Create new tags in the TagOperator spreadsheet
    const create_mods = simplified_mods.filter(
        (mod) => mod.type === TagModificationType.CREATE,
    );
    const create_data: string[][] = [];
    for (const mod of create_mods) {
        create_data.push([
            mod.tag.id,
            mod.tag.name,
            mod.tag.color,
            mod.tag.icon,
            mod.tag.aliases.join(","),
            mod.tag.children.join(","),
            mod.tag.parent,
        ]);
    }
    let create_response;
    if (Object.keys(create_data).length > 0) {
        console.log("Creating tags", create_data);
        create_response = append_named_rows(
            spreadsheetId,
            tag_sheet,
            create_data,
            TAG_ID_INDEX,
        );
    }

    // Delete tags from the TagOperator spreadsheet
    const delete_mods = simplified_mods.filter(
        (mod) => mod.type === TagModificationType.DELETE,
    );
    const delete_names = delete_mods.map((mod) => mod.tag.id);
    let delete_response;
    if (delete_names.length > 0) {
        console.log("Deleting tags", delete_names);
        delete_response = delete_named_rows(spreadsheet, delete_names);
    }

    // Wait for all the updates to complete
    await Promise.all([update_response, create_response, delete_response]);

    // Return the updated spreadsheet
    return get_tag_sheet_data(spreadsheetId);
}

export async function apply_file_modifications(
    spreadsheet: Spreadsheet,
    file_modifications: FileModification[],
) {
    const simplified_mods = simplify_file_mod_queue(file_modifications);
    console.log("Simplified mods", simplified_mods);
    // Get the spreadsheet id of the TagOperator spreadsheet
    const spreadsheetId = spreadsheet.spreadsheetId;
    // Get the Tags sheet from the spreadsheet
    const files_sheet = spreadsheet.sheets.find(
        (sheet) => sheet.properties.title === "Files",
    );
    if (!files_sheet) {
        throw Error("Files sheet not found in spreadsheet" + spreadsheetId);
    }
    const FILE_ID_INDEX = 0; // sheet_id

    // Update existing tags in the TagOperator spreadsheet
    const update_mods = simplified_mods.filter(
        (mod) => mod.type === FileModificationType.UPDATE,
    );
    const update_data: string[][] = [];
    for (const mod of update_mods) {
        update_data.push([
            mod.file.sheet_id,
            mod.file.gid,
            mod.file.tags.join(","),
            mod.file.search_string,
        ]);
    }
    console.log("All mods", file_modifications);
    console.log("Update data", update_data);
    let update_response;
    if (Object.keys(update_data).length > 0) {
        update_response = update_named_rows(
            spreadsheetId,
            update_data,
            FILE_ID_INDEX,
        );
        console.log("Update response", await update_response);
    }

    // Create new tags in the TagOperator spreadsheet
    const create_mods = simplified_mods.filter(
        (mod) => mod.type === FileModificationType.CREATE,
    );
    const create_data: string[][] = [];
    for (const mod of create_mods) {
        create_data.push([
            mod.file.sheet_id,
            mod.file.gid,
            mod.file.tags.join(","),
            mod.file.search_string,
        ]);
    }
    let create_response;
    if (Object.keys(create_data).length > 0) {
        console.log("Creating files", create_data);
        create_response = append_named_rows(
            spreadsheetId,
            files_sheet,
            create_data,
            FILE_ID_INDEX,
        );
    }

    // Delete tags from the TagOperator spreadsheet
    const delete_mods = simplified_mods.filter(
        (mod) => mod.type === FileModificationType.DELETE,
    );
    const delete_names = delete_mods.map((mod) => mod.file.sheet_id);
    let delete_response;
    if (delete_names.length > 0) {
        console.log("Deleting files", delete_names);
        delete_response = delete_named_rows(spreadsheet, delete_names);
    }

    // Wait for all the updates to complete
    await Promise.all([update_response, create_response, delete_response]);

    // Return the updated spreadsheet
    return get_tag_sheet_data(spreadsheetId);
}

function simplify_tag_mod_queue(
    tag_mod_queue: TagModification[],
): TagModification[] {
    const simplified_tag_mods: { [tag_id: TagID]: TagModification } = {};
    for (const mod of tag_mod_queue) {
        if (mod.tag.id in simplified_tag_mods) {
            if (mod.type === TagModificationType.DELETE) {
                if (
                    simplified_tag_mods[mod.tag.id].type ===
                    TagModificationType.CREATE
                ) {
                    // If the existing mod is a create, we don't actually need to create the tag
                    delete simplified_tag_mods[mod.tag.id];
                } else {
                    // The mod must be an update, so we can just change the type
                    simplified_tag_mods[mod.tag.id].type =
                        TagModificationType.DELETE;
                }
            } else {
                // If the existing mod is a create, we only want to modify
                // the tag data and keep the create call, so the type should
                // stay as a create. If the existing mod is an update, and
                // this mod is also an update, we don't need to change the type.
                simplified_tag_mods[mod.tag.id].tag = mod.tag;
            }
        } else {
            simplified_tag_mods[mod.tag.id] = mod;
        }
    }
    return Object.values(simplified_tag_mods);
}

function simplify_file_mod_queue(
    file_mod_queue: FileModification[],
): FileModification[] {
    const new_mods: { [file_id: FileID]: FileModification } = {};
    for (const mod of file_mod_queue) {
        if (mod.file.gid in new_mods) {
            // If the current mod is a delete,
            if (mod.type === FileModificationType.DELETE) {
                // If the existing mod is a create, we don't actually need to create the tag
                if (
                    new_mods[mod.file.gid].type === FileModificationType.CREATE
                ) {
                    delete new_mods[mod.file.gid];
                } else {
                    // The mod must be an update, so we can just change the type
                    new_mods[mod.file.gid] = mod;
                }
            } else {
                // If the existing mod is a delete and this is a create, then
                // the file actually already exists in the spreadsheet, so instead
                // of deleting and creating it we can just update it.
                if (
                    new_mods[mod.file.gid].type ===
                        FileModificationType.DELETE &&
                    (mod.type === FileModificationType.CREATE ||
                        mod.type === FileModificationType.UPDATE)
                ) {
                    new_mods[mod.file.gid] = {
                        type: FileModificationType.UPDATE,
                        file: mod.file,
                    };
                } else {
                    // If the existing mod is a create, we only want to modify
                    // the tag data and keep the create call, so the type should
                    // stay as a create. If the existing mod is an update, and
                    // this mod is also an update, we don't need to change the type.
                    new_mods[mod.file.gid] = {
                        type: new_mods[mod.file.gid].type,
                        file: mod.file,
                    };
                }
            }
        } else {
            new_mods[mod.file.gid] = mod;
        }
    }
    return Object.values(new_mods);
}

// async function create_tag_file(drive_id: string): Promise<string> {
//     console.log("Creating tag file");
//     const fileData = JSON.stringify({
//         TAG_DATA: {},
//         FILE_DATA: {
//             "": {
//                 "tags": [],
//                 "search_string": "",
//             }
//         }

//     } as TagFile);
//     const fileMetadata: GoogleFileModifier = {
//         name: TAG_FILE_NAME,
//         parents: [drive_id || "root"],
//         mimeType: 'application/vnd.google-apps.document',
//         appProperties: {
//             "tag-operator-version": "1.0.0",
//         },
//     };
//     const result = await google_modular.files.create(fileData, fileMetadata, {
//         supportsAllDrives: true,
//     });
//     console.log("Created new tag file", result);
//     return result.id;
// }

// export async function get_tag_file_metadata(drive_id: string) {
//     const params = {
//         corpora: drive_id == "" ? "user" : "drive",
//         driveId: drive_id,
//         pageSize: 1,
//         q: `name='${TAG_FILE_NAME}' and trashed=false and mimeType='application/vnd.google-apps.document'`,
//         fields: "files(*)", //"files(id, name, mimeType)",
//         supportsAllDrives: true,
//         includeItemsFromAllDrives: drive_id != "",
//     }

//     const result = await google_modular.files.list(params);
//     let files = await result.files;
//     if (files.length > 0) {
//         console.log("Returning file")
//         return await result.files[0];
//     } else {
//         console.log("Creating file")
//         await create_tag_file(drive_id);
//         console.log("Relisting files")
//         const new_result = await google_modular.files.list(params);
//         files = await new_result.files;
//         console.log("New result", await new_result)
//         return files[0];
//     }
// }

// export async function get_tag_file_data(tag_file_metadata: GoogleFile) {
//     const file_data = await google_modular.files.export(tag_file_metadata.id, "text/plain");
//     console.log(await file_data);
//     if (!(await file_data)) {
//         console.log("No file data")
//         return {};
//     }
//     console.log("tags file data: |" + await file_data + "|")
//     return JSON.parse(await file_data);
// }

// // export async function get_tag_file_data(drive_id: string) {
// //     const tag_file_metadata = await get_tag_file_metadata(drive_id);
// //     const file_data = await google_modular.files.get_data(tag_file_metadata.id, {
// //         supportsAllDrives: true,
// //         alt: "media",
// //     });
// //     console.log(new TextDecoder().decode((await file_data).body.getReader().read().buffer));
// //     return {};
// //     if (file_data === null) {
// //         return {};
// //     }
// //     return file_data;
// // }

// export async function save_tag_file(tag_file: TagFile, tag_file_metadata: GoogleFile, drive_id: string){
//     // Check if the tag file exists
//     if (!tag_file_metadata) {
//         tag_file_metadata = await get_tag_file_metadata(drive_id);
//     }

//     console.log("Saving tag file");
//     const result = await google_modular.files.update(tag_file_metadata.id, JSON.stringify(tag_file), {
//         mimeType: tag_file_metadata.mimeType,
//         name: tag_file_metadata.name,
//     }, {
//         supportsAllDrives: true,
//     });

//     console.log("Saved tag file", await result);
// }

// export async function delete_tag_files_in_drive(drive_id: string) {
//     const result = await google_modular.files.list({
//         corpora: drive_id == "" ? "user" : "drive",
//         driveId: drive_id,
//         pageSize: 10,
//         q: `name='${TAG_FILE_NAME}' and trashed=false`,
//         fields: "files(*)",//"files(id, name, mimeType)",
//         supportsAllDrives: true,
//         includeItemsFromAllDrives: drive_id != "",
//     });
//     console.log("Deleting Results", await result);
//     for (const file of await result.files) {
//         console.log("Deleting file", file);
//         await google_modular.files.delete(file.id, {supportsAllDrives: true});
//     }
// }
