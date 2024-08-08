import google_modular from "./google_modular";
import { DriveListResponse, FileListResponse, GoogleFileModifier, GoogleFile } from "./google_types";
import { TAG_FILE_NAME } from "../assets/constants";
import { NamedRange, ParsedSpreadsheetValues, Spreadsheet, UpdateRequest, ValueRange } from "./google_types/spreadsheets";
import { TagList } from "../tag/tag_types";
import { FileTagData } from "../file/file_types";

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

const ALLOWED_MIME_TYPES_STRING = "((mimeType = '" + ALLOWED_MIME_TYPES.join("') or (mimeType = '") + "'))";

export const MIME_TYPE_TO_NAME: {[id: string]: string} = {
    "application/vnd.google-apps.document": "Document",
    "application/vnd.google-apps.spreadsheet": "Spreadsheet",
    "application/vnd.google-apps.presentation": "Slideshow",
    "application/vnd.google-apps.form": "Form",
    "application/msword": "Word Doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "Powerpoint",
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
}

export async function get_drive_list(): Promise<DriveListResponse> {
    return google_modular.drives.list({
        pageSize: 100,
        fields: "drives(id, name, colorRgb)",
        orderBy: "name, recency desc",
    })
}

export async function get_file_list(drive_id: string): Promise<GoogleFile[]> {
    let response: FileListResponse;
    let files: GoogleFile[] = [];
    let pageToken: string | undefined = undefined;
    
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
            console.log(err)
            alert("Error getting files from Google Drive. Please try again later.");
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


export async function create_tag_sheet(drive_id: string): Promise<string> {
    console.log("Creating tag sheet");
    const fileMetadata: GoogleFileModifier = {
        name: TAG_FILE_NAME,
        parents: [drive_id || "root"],
        mimeType: 'application/vnd.google-apps.spreadsheet',
        appProperties: {
            "tag-operator-version": "1.0.0",
        },
    };
    const tag_sheet = await google_modular.files.create_no_content(fileMetadata, {
        supportsAllDrives: true,
    });
    const spreadsheetId = tag_sheet.id;
    
    // Create spreadsheet with 2 sheets: Tags and Files
    await google_modular.spreadsheets.batchUpdate(spreadsheetId, {
        requests: [
            {
                addSheet: {
                    properties: {
                        title: "Tags",
                    },
                },
            },
            {
                addSheet: {
                    properties: {
                        title: "Files",
                    },
                },
            },
            {
                deleteSheet: {
                    sheetId: 0,
                },
            },
        ],
    });
    // Initialize the tag sheet with the header values
    const inintialize_tags_header = value_range_factory("Tags!A1:G1", [
        ["ID", "Name", "Color", "Icon", "Aliases", "Child IDs", "Parent ID"]
    ]);
    const inintialize_files_header = value_range_factory("Files!A1:C1", [
        ["Google ID", "Tag IDs","Search String"]
    ]);
    
    update_tag_sheet_values(spreadsheetId, [
        inintialize_tags_header,
        inintialize_files_header,
    ]).then((result) => {
        console.log("Initialized tag sheet with values", result);
    });

    return spreadsheetId;
}

export async function get_tag_sheet_id(drive_id: string): Promise<string> {
    // Parameters to search for the tag file
    const params = {
        corpora: drive_id == "" ? "user" : "drive",
        driveId: drive_id,
        pageSize: 1,
        q: `name='${TAG_FILE_NAME}' and trashed=false and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: "files(*)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: drive_id != "",
    }

    const result = await google_modular.files.list(params);
    const files = result.files;
    // Tag file exists
    if (files.length > 0) {
        return result.files[0].id;
    // Tag file does not exist, so create it
    } else {
        return await create_tag_sheet(drive_id);
    }
}

export async function get_tag_sheet_metadata(spreadsheetId: string): Promise<Spreadsheet> {
    return google_modular.spreadsheets.get(spreadsheetId, {
        includeGridData: false,
    });
}

export async function get_tag_sheet_data(spreadsheetId: string) {
    // Get all the data from the tag sheet
    // The first row is the header, which has the column names
    // ID	      Name	    Color	       Aliases	Child IDs   Parent ID   [for Tags]
    // Google ID  Tag IDs	Search String                                   [for Files]
    // All following rows have the tag and file data
    const sheetData = await google_modular.spreadsheets.get(spreadsheetId, {
        ranges: ["Tags!A1:G", "Files!A1:C"],
        includeGridData: true,
    });

    return sheetData;

    // For some reason, batchGet gives me a cors error
    // return await google_modular.spreadsheets.values.batchGet(spreadsheetId, {
    //     ranges: ["Tags!A1:F", "Files!A1:C"],
    //     majorDimension: "ROWS",
    // });
}

export function parse_values_from_spreadsheet(spreadsheet: Spreadsheet): ParsedSpreadsheetValues {
    const data: ParsedSpreadsheetValues = {};
    if (!spreadsheet.sheets) {
        return data;
    }
    // For each sheet in the spreadsheet
    for (const [sheet_index, sheet]  of spreadsheet.sheets.entries()) {
        data[sheet_index] = {};
        // For each query range present in the sheet
        for (const [query_index, queryBlock] of sheet.data.entries()) {
            if (!queryBlock || !queryBlock.rowData) {
                continue;
            }
            data[sheet_index][query_index] = {};
            for (const [row_index, row] of queryBlock.rowData.entries()) {
                if (!row.values) {
                    continue;
                }
                const cellData = row.values;
                const values: string[] = cellData.map((cell) => cell.formattedValue || cell.effectiveValue?.stringValue || "");
                data[sheet_index][query_index][row_index] = values;
            }
        }
    }
    return data;
}

export function parse_tag_data_from_sheet_values(sheetData: ParsedSpreadsheetValues): TagList {
    // Parse the data into Tag format
    const tags: TagList = {};
    // Tag data is stored in the first sheet
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
        }
    }
    return tags;
}

export function parse_file_data_from_sheet_values(sheetData: ParsedSpreadsheetValues): FileTagData {
    const files: FileTagData = {};
    // File data is stored in the second sheet
    for (const [row_index, row] of Object.entries(sheetData[1][0])) {
        // Skip the header row
        if (row_index === "0") {
            continue;
        }
        // Parse the file out of the row
        const [google_id, tag_ids, search_string] = row;
        files[google_id] = {
            tags: tag_ids ? tag_ids.split(",") : [],
            search_string: search_string || "",
        };
    }
    return files;
}

export async function update_tag_sheet_values(spreadsheetId: string, valueRanges: ValueRange[]) {
    return google_modular.spreadsheets.values.batchUpdate(spreadsheetId, {
        valueInputOption: "RAW",
        data: valueRanges,
    });
}

export function value_range_factory(range: string, values: string[][]): ValueRange {
    return {
        range: range,
        majorDimension: "ROWS",
        values: values,
    }
}

export function named_range_factory(
        sheetId: number,
        startRowIndex: number,
        endRowIndex: number,
        startColumnIndex: number,
        endColumnIndex: number,
        name: string): NamedRange {
    return {
        name: name,
        range: {
            sheetId: sheetId,
            startRowIndex: startRowIndex,
            endRowIndex: endRowIndex,
            startColumnIndex: startColumnIndex,
            endColumnIndex: endColumnIndex,
        }
    }
}

export async function create_tag_rows(spreadsheet: Spreadsheet, tags: TagList) {
    const spreadsheetId = spreadsheet.spreadsheetId;
    // Get the end index of the tag table (rows are 1-indexed)
    const tag_table_end_index = spreadsheet.sheets[0].data[0].rowData.length;
    // The tag sheet must have a sheet id to add a named range, so if it doesn't, there is something wrong
    if (!spreadsheet.sheets[0].properties.sheetId) {
        throw Error("Spreadsheet Tag sheet (index 0) does not have a valid sheetId!")
    }
    const tag_sheet_id = spreadsheet.sheets[0].properties.sheetId
    const tag_values = Object.values(tags);
    // Map the tag into a row of values
    const tag_rows = tag_values.map((tag) => [
        tag.id,
        tag.name,
        tag.color,
        tag.icon,
        tag.aliases.join(","),
        tag.children.join(","),
        tag.parent,
    ]);

    // Create value ranges to add tags to the tag sheet
    const value_updates = [];
    for (let i = 0; i < tag_rows.length; i++) {
        // tag_table_length is the number of tags already in the tag sheet *including* the header.
        // However, value ranges are 1-indexed, so we need to bump the index up by one for each row.
        // So, the new tag should be added at tag_table_length + 1 + i
        value_updates.push(value_range_factory(`Tags!A${tag_table_end_index + 1 + i}:G${tag_table_end_index + 1 + i}`, [tag_rows[i]]));
    }
    await update_tag_sheet_values(spreadsheetId, value_updates);

    // Create named ranges to later access the tags
    const named_ranges = [];
    for (let i = 0; i < tag_values.length; i++) {
        // Add the named range for the tag
        named_ranges.push(named_range_factory(tag_sheet_id, tag_table_end_index + i, tag_table_end_index + 1 + i, 0, 7, tag_values[i].id));
    }
    return google_modular.spreadsheets.batchUpdate(spreadsheetId, {
        requests: named_ranges.map((range) => ({addNamedRange: {namedRange: range}})),
    });
}

export function generate_tag_ids(number_of_ids: number = 1): string[] {
    const ids = [];
    for (let i = 0; i < number_of_ids; i++) {
        ids.push("T" + crypto.randomUUID().replace(/-/g, ""))
    }
    return ids;
}











async function create_tag_file(drive_id: string): Promise<string> {
    console.log("Creating tag file");
    const fileData = JSON.stringify({
        TAG_DATA: {},
        FILE_DATA: {
            "": {
                "tags": [],
                "search_string": "",
            }
        }

    } as TagFile);
    const fileMetadata: GoogleFileModifier = {
        name: TAG_FILE_NAME,
        parents: [drive_id || "root"],
        mimeType: 'application/vnd.google-apps.document',
        appProperties: {
            "tag-operator-version": "1.0.0",
        },
    };
    const result = await google_modular.files.create(fileData, fileMetadata, {
        supportsAllDrives: true,
    });
    console.log("Created new tag file", result);
    return result.id;
}

export async function get_tag_file_metadata(drive_id: string) {
    const params = {
        corpora: drive_id == "" ? "user" : "drive",
        driveId: drive_id,
        pageSize: 1,
        q: `name='${TAG_FILE_NAME}' and trashed=false and mimeType='application/vnd.google-apps.document'`,
        fields: "files(*)", //"files(id, name, mimeType)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: drive_id != "",
    }

    const result = await google_modular.files.list(params);
    let files = await result.files;
    if (files.length > 0) {
        console.log("Returning file")
        return await result.files[0];
    } else {
        console.log("Creating file")
        await create_tag_file(drive_id);
        console.log("Relisting files")
        const new_result = await google_modular.files.list(params);
        files = await new_result.files;
        console.log("New result", await new_result)
        return files[0];
    }
}

export async function get_tag_file_data(tag_file_metadata: GoogleFile) {
    const file_data = await google_modular.files.export(tag_file_metadata.id, "text/plain");
    console.log(await file_data);
    if (!(await file_data)) {
        console.log("No file data")
        return {};
    }
    console.log("tags file data: |" + await file_data + "|")
    return JSON.parse(await file_data);
}

// export async function get_tag_file_data(drive_id: string) {
//     const tag_file_metadata = await get_tag_file_metadata(drive_id);
//     const file_data = await google_modular.files.get_data(tag_file_metadata.id, {
//         supportsAllDrives: true,
//         alt: "media",
//     });
//     console.log(new TextDecoder().decode((await file_data).body.getReader().read().buffer));
//     return {};
//     if (file_data === null) {
//         return {};
//     }
//     return file_data;
// }

export async function save_tag_file(tag_file: TagFile, tag_file_metadata: GoogleFile, drive_id: string){
    // Check if the tag file exists
    if (!tag_file_metadata) {
        tag_file_metadata = await get_tag_file_metadata(drive_id);
    }

    console.log("Saving tag file");
    const result = await google_modular.files.update(tag_file_metadata.id, JSON.stringify(tag_file), {
        mimeType: tag_file_metadata.mimeType,
        name: tag_file_metadata.name,
    }, {
        supportsAllDrives: true,
    });

    console.log("Saved tag file", await result);
}


export async function delete_tag_files_in_drive(drive_id: string) {
    const result = await google_modular.files.list({
        corpora: drive_id == "" ? "user" : "drive",
        driveId: drive_id,
        pageSize: 10,
        q: `name='${TAG_FILE_NAME}' and trashed=false`,
        fields: "files(*)",//"files(id, name, mimeType)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: drive_id != "",
    });
    console.log("Deleting Results", await result);
    for (const file of await result.files) {
        console.log("Deleting file", file);
        await google_modular.files.delete(file.id, {supportsAllDrives: true});
    }
}