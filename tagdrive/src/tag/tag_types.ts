export type TagID = string;
export type TagColor = string; // CSS valid color string, e.g. "#ff0000" or "red"
export type FileID = string; // Given from Google API

export type Tag = {
    color: TagColor;
    name: string;
    aliases: string[];
    children: TagID[];
};

export type TagFile = {
    TAG_DATA: {
        [tag_id: TagID]: {
            color: string,
            name: string,
            aliases: TagID[],
            children: TagID[],
        }
    },
    FILE_DATA: FileTagData,
}

export type FileTagData = {
    [file_id: FileID]: {
        tags: TagID[],
        search_string: string,
    }
}

export type TagList = {
    [id: TagID]: Tag;
};

// export type File = {
//     id: FileID;
//     tags: Tag[];
// };

// export type FileElement = {
//     name: string;
//     fb: string;
//     filetype: string;
//     tags: TagID[];
// };
