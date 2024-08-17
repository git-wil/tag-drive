export type TagID = string; // uuid
export type TagColor = string; // From the list of possible tag colors

export type Tag = {
    id: TagID;
    name: string;
    color: TagColor;
    icon: string;
    aliases: string[];
    children: TagID[];
    parent: TagID;
};

export type TagList = {
    [id: TagID]: Tag;
};

export enum TagModificationType {
    CREATE = "TAG.CREATE",
    DELETE = "TAG.DELETE",
    UPDATE = "TAG.UPDATE",
}

export type TagModification = {
    type: TagModificationType;
    tag: Tag;
};

export type TagApplier =
    | "click"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "0";
