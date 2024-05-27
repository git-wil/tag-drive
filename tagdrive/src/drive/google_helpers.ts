import google_modular from "./google_modular";
import { DriveListResponse } from "./types";

export async function get_drive_list(): Promise<DriveListResponse> {
    return google_modular.drives.list({
        pageSize: 100,
    })
}

export async function get_file_list() {
    return google_modular.files.list({

    })
}