import google_modular from "./google_modular";
import { DriveListResponse, FileListResponse, GoogleFileModifier, GoogleFile } from "./google_types";
import { TagFile, TagList } from "../tag/tag_types";
import { TAG_FILE_NAME } from "../assets/constants";

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
    console.log("Created new tag file", await result);
    return await result.id;
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

export async function save_tag_file(tag_file: TagFile, tag_file_metadata: GoogleFile, drive_id: string): Promise<GoogleFile> {
    // Check if the tag file exists
    if (!tag_file_metadata) {
        tag_file_metadata = await get_tag_file_metadata(drive_id);
    }

    const result = await google_modular.files.update(tag_file_metadata.id, JSON.stringify(tag_file), {
        mimeType: tag_file_metadata.mimeType,
        name: tag_file_metadata.name,
    }, {
        supportsAllDrives: true,
    });
    console.log(await result);
    
    return await result;
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