import { FileUpdateQuery, FileDeleteQuery, FileListResponse, FileListQuery, DriveListQuery, DriveListResponse, FileGenerateIdQuery, FileGenerateIdResponse, GoogleFile, FileCreateQuery, GoogleFileModifier, FileGetQuery as FileGetMetaDataQuery } from "./google_types";
import { getAuth } from "./auth";

function create_query_string(params: {[name: string]: unknown}): string {
    return "?" + Object.entries(params).map(([key, value]) => `${key}=${value}`).join("&");
}

class files_class {
    static #base_url = "https://www.googleapis.com/drive/v3/files";
    static #upload_url = "https://www.googleapis.com/upload/drive/v3/files";

    static async list(params: FileListQuery): Promise<FileListResponse> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#base_url + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response.json();
    }

    static async get_metadata(file_id: string, params: FileGetMetaDataQuery): Promise<GoogleFile> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
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
        const response = await fetch(files_class.#base_url + `/${file_id}` + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response;
    }

    static async export(file_id: string, mimeType: string): Promise<string> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        const response = await fetch(files_class.#base_url + `/${file_id}/export` + create_query_string({ mimeType }), {
            method: "GET",
            headers,
        });
        return await response.text();
    }

    static async generateIds(params: FileGenerateIdQuery): Promise<FileGenerateIdResponse> {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#base_url + "/generateIds" + create_query_string(params), {
            method: "GET",
            headers,
        });
        return await response.json();
    }

    static async update(file_id: string, file_content: string, file_metadata: GoogleFileModifier, params: FileUpdateQuery): Promise<GoogleFile> {
        console.log("Updating file", file_metadata, file_content)
        // const blob_file = new Blob([file_content ? file_content : ""], {type: file_metadata.mimeType || "text/plain"});
        const blob_file = new Blob([file_content ? file_content : ""], {type: "text/plain"});

        params["uploadType"] = "multipart";
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(file_metadata)], { type: 'application/json' }));
        form.append('file', blob_file);

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
        // headers.append('X-Upload-Content-Length', blob_file.size.toString());
        // headers.append('X-Upload-Content-Type', file_metadata.mimeType || "text/plain");
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#upload_url + `/${file_id}` + create_query_string(params), {
            method: "PATCH",
            headers,
            body: form,
        });
        /// console.log("Update Response json", await response.json())
        return await response.json();
    }

    static async update_metadata(file_id: string, file_metadata: GoogleFileModifier, params: FileUpdateQuery): Promise<GoogleFile> {

        // params["uploadType"] = "multipart";
        // const form = new FormData();
        // form.append('metadata', new Blob([JSON.stringify(file_metadata)], { type: 'application/json' }));

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
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
        // Using this method https://stackoverflow.com/questions/68655145/create-folders-in-a-shared-drive-google-drive-api-with-javascript
        const response = await fetch(files_class.#upload_url + create_query_string(params), {
            method: "POST",
            headers,
            body: form,
        });
        return await response.json();
    }

    static async delete(file_id: string, params: FileDeleteQuery) {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${await getAuth()}`);
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
        const response = await fetch(drives_class.#url + create_query_string(params), {
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
