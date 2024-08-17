import { TagID } from "../tag/tag_types";

export type FileID = string; // Given from Google API

export type FileData = {
    sheet_id: string;
    gid: FileID;
    tags: TagID[];
    search_string: string;
};

export type FileList = {
    [gid: FileID]: FileData;
};

export enum FileModificationType {
    CREATE = "FILE.CREATE",
    DELETE = "FILE.DELETE",
    UPDATE = "FILE.UPDATE",
}

export type FileModification = {
    type: FileModificationType;
    file: FileData;
};
