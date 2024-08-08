export type FileID = string; // Given from Google API

export type FileTagData = {
    [file_id: FileID]: {
        tags: TagID[],
        search_string: string,
    }
}
