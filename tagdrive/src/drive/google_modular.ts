import { FileCreateQuery, FileDeleteQuery, FileListResponse, FileListQuery, DriveListQuery, FileCreateResponse, DriveListResponse } from "./types";
import { getAuth } from "./auth";

function create_query_string(params: {[name: string]: unknown}): string {
    return "?" + Object.entries(params).map(([key, value]) => `${key}=${value}`).join("&");
}

class files_class {
    static #endpoint = "https://www.googleapis.com/drive/v3/files";
    static #url = new URL(files_class.#endpoint);

    static async list(params: FileListQuery): Promise<FileListResponse> {
        params["fields"] = "files(kind, id, name, mimeType, webViewLink, hasThumbnail, thumbnailLink)";
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#url.toString() + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response.json();
    }

    static async create(file: File, params: FileCreateQuery): Promise<FileCreateResponse> {
        // Create a new file specified by the file input, while including query parameters
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("Content-Type", "application/json");
        // Include both the file and the parameters in the body of the request as the Google Drive API requires
        const response = await fetch(files_class.#url.toString() + create_query_string(params), {
            method: "POST",
            body: JSON.stringify(file),
            headers,
        });
        return await response.json();

    }

    static async delete(fileId: string, params: FileDeleteQuery) {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        await fetch(files_class.#url.toString() + "/" + fileId + create_query_string(params), {
            method: "DELETE",
            headers,
        });
    }
}

class drives_class {
    static #endpoint = "https://www.googleapis.com/drive/v3/drives";
    static #url = new URL(drives_class.#endpoint);

    static async list(params: DriveListQuery): Promise<DriveListResponse> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        const response = await fetch(drives_class.#url.toString() + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response.json();
    }
}

export default class google_modular {
    static files = files_class;
    static drives = drives_class;
}
