export type TagID = string; // uuid
export type TagColor = string; // From the list of possible tag colors

export type Tag = {
    id: TagID;
    name: string;
    icon: string;
    color: TagColor;
    aliases: string[];
    children: TagID[];
    parent: TagID;
};

export type TagList = {
    [id: TagID]: Tag;
};