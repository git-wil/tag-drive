export type TagID = string;
export type TagColor = string; // CSS valid color string, e.g. "#ff0000" or "red"
export type FileID = string; // Given from Google API

export type Tag = {
    id: TagID;
    color: TagColor;
    name: string;
    aliases: string[];
    children: TagID[];
    files: FileID[];
};

export type File = {
    id: FileID;
    tags: Tag[];
};

export type FileElement = {
    name: string;
    fb: string;
    filetype: string;
    tags: TagID[];
};
