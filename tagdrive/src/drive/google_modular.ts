import { FileUpdateQuery, FileDeleteQuery, FileListResponse, FileListQuery, DriveListQuery, DriveListResponse, FileGenerateIdQuery, FileGenerateIdResponse, GoogleFile, FileCreateQuery, GoogleFileModifier, FileGetQuery as FileGetMetaDataQuery } from "./google_types";
import { getAuth } from "./auth";
import { API_KEY } from "./credentials";
import * as SheetTypes from "./google_types/spreadsheets";


function create_query_string(params: {[name: string]: unknown}): string {
    return "?" + Object.entries(params).map(([key, value]) => `${key}=${value}`).join("&");
}

class files_class {
    static #base_url = "https://www.googleapis.com/drive/v3/files";
    static #upload_url = "https://www.googleapis.com/upload/drive/v3/files";

    static async list(params: FileListQuery): Promise<FileListResponse> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#base_url + create_query_string(params), {
            method: "GET",
            headers,
        });
        const json = await response.json();
        return await json;
    }

    static async get_metadata(file_id: string, params: FileGetMetaDataQuery): Promise<GoogleFile> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(files_class.#base_url + `/${file_id}` + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response.json();
    }

    static async get_data(file_id: string, params: FileGetMetaDataQuery): Promise<unknown> {
        params["alt"] = "media";
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(files_class.#base_url + `/${file_id}` + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response;
    }

    static async export(file_id: string, mimeType: string): Promise<string> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(files_class.#base_url + `/${file_id}/export` + create_query_string({ mimeType }), {
            method: "GET",
            headers,
        });
        return await response.text();
    }

    static async generateIds(params: FileGenerateIdQuery): Promise<FileGenerateIdResponse> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#base_url + "/generateIds" + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response.json();
    }

    static async update(file_id: string, file_content: string, file_metadata: GoogleFileModifier, params: FileUpdateQuery): Promise<GoogleFile> {
        console.log("Updating file", file_metadata, file_content)

        // Create the metadata for the file
        const json_metadata = JSON.stringify(file_metadata);
        const json_metadata_size = new TextEncoder().encode(json_metadata).length;

        params["uploadType"] = "resumable";

        // Create headers for resumable upload (only sending metadata)
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("Content-Type", "application/json; charset=UTF-8");
        headers.append("X-goog-api-key", API_KEY);
        headers.append("Content-Length", json_metadata_size.toString());
        const response = await fetch(files_class.#upload_url + `/${file_id}` + create_query_string(params), {
            method: "PATCH",
            headers,
            body: json_metadata,
            keepalive: true,
        });
        // Get resumable upload uri
        const resume_uri: string = response.headers.get("Location") || "";

        const blob_file = new Blob([file_content ? file_content : ""], {type: "text/plain"});

        const form = new FormData();
        form.append('file', blob_file);

        const upload_headers = new Headers();
        upload_headers.append("Content-Length", blob_file.size.toString());

        // Upload file data to resumable uri
        const upload_response = await fetch(resume_uri, {
            method: "PUT",
            headers,
            body: blob_file,
        });

        return upload_response.json();
    }

    static async update_metadata(file_id: string, file_metadata: GoogleFileModifier, params: FileUpdateQuery): Promise<GoogleFile> {

        // params["uploadType"] = "multipart";
        // const form = new FormData();
        // form.append('metadata', new Blob([JSON.stringify(file_metadata)], { type: 'application/json' }));

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#base_url + `/${file_id}` + create_query_string(params), {
            method: "PATCH",
            headers,
            body: JSON.stringify(file_metadata),
        });
        return await response.json();
    }

    static async create(file_content: string, file_metadata: GoogleFileModifier, params: FileCreateQuery): Promise<GoogleFile> {
        console.log("Creating file", file_metadata, file_content)
        // const blob_file = new Blob([file_content ? file_content : ""], {type: file_metadata.mimeType || "text/plain"});
        const blob_file = new Blob([file_content ? file_content : ""], {type: "text/plain"});

        params["uploadType"] = "multipart";
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(file_metadata)], { type: 'application/json' }));
        form.append('file', blob_file);

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#upload_url + create_query_string(params), {
            method: "POST",
            headers,
            body: form,
        });
        return await response.json();
    }
    
    static async create_no_content(file_metadata: GoogleFileModifier, params: FileCreateQuery): Promise<GoogleFile> {
        console.log("Creating file", file_metadata)
        // const blob_file = new Blob([file_content ? file_content : ""], {type: file_metadata.mimeType || "text/plain"});

        params["uploadType"] = "multipart";
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(file_metadata)], { type: 'application/json' }));

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#base_url + create_query_string(params), {
            method: "POST",
            headers,
            body: JSON.stringify(file_metadata),
        });
        return await response.json();
    }

    static async delete(file_id: string, params: FileDeleteQuery) {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        await fetch(files_class.#base_url + "/" + file_id + create_query_string(params), {
            method: "DELETE",
            headers,
        });
        // return status?
    }
}

class drives_class {
    static #endpoint = "https://www.googleapis.com/drive/v3/drives";
    static #url = new URL(drives_class.#endpoint);

    static async list(params: DriveListQuery): Promise<DriveListResponse> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(drives_class.#url + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response.json();
    }
}


class spreadsheets_values_class {
    static #base_url = "https://sheets.googleapis.com/v4/spreadsheets";

    static async get(spreadsheetId: string, range: string, body: SheetTypes.values.getRequestBody): Promise<SheetTypes.values.getResponseBody> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(spreadsheets_values_class.#base_url + `/${spreadsheetId}/values/${range}`, {
            method: "GET",
            headers,
            body: JSON.stringify(body),
        });
        return await response.json();
    }

    static async batchGet(spreadsheetId: string, params: SheetTypes.values.batchGetQuery): Promise<SheetTypes.values.batchGetResponseBody> {
        const query = "&majorDimension=" + params.majorDimension + "&ranges=" + "[" + params.ranges.map(range => `"${range}"`).join(",") + "]";
        console.log("batch get Query", query);
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(spreadsheets_values_class.#base_url + `/${spreadsheetId}/values:batchGet` + query, {
            method: "GET",
            headers,
        });
        return await response.json();
    }

    static async append(spreadsheet_id: string, range: string, body: SheetTypes.values.appendRequestBody) {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(spreadsheets_values_class.#base_url + `/${spreadsheet_id}/values/${range}:append`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        console.log("Append values response:", await response.json());
    }

    static async batchUpdate(spreadsheet_id: string, body: SheetTypes.values.batchUpdateRequestBody) {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(spreadsheets_values_class.#base_url + `/${spreadsheet_id}/values:batchUpdate`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        console.log("Batch update values response:", await response.json());
    }
}

class spreadsheets_class {
    static #base_url = "https://sheets.googleapis.com/v4/spreadsheets";
    
    static values = spreadsheets_values_class;

    static async get(spreadsheetId: string, params: SheetTypes.getSpreadsheetQuery): Promise<SheetTypes.Spreadsheet> {
        const query = "?includeGridData=" + params.includeGridData + params.ranges?.map(range => "&ranges=" + range).join("");
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(spreadsheets_class.#base_url + `/${spreadsheetId}` + query, {
            method: "GET",
            headers,
        });
        return await response.json();
    }

    static async batchUpdate(spreadsheetId: string, body: SheetTypes.batchUpdateRequestBody): Promise<SheetTypes.batchUpdateResponseBody> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        headers.append("X-goog-api-key", API_KEY);
        const response = await fetch(spreadsheets_class.#base_url + `/${spreadsheetId}:batchUpdate`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        const rj = await response.json();
        console.log("Batch update response:", rj);
        return rj;
    }
}

export default class google_modular {
    static files = files_class;
    static drives = drives_class;
    static spreadsheets = spreadsheets_class;
}
