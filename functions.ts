import { FileElement, FileID, TagID } from "./types";
import Fuse from "fuse.js";
var filesDict: { [key: FileID]: FileElement } = {};
var tags: TagID[];
var files: FileID[];
var search_threshold: 0.1 | 0.5 = 0.1; // "exact match" is 0.1 and "fuzzy search" is 0.5

import { google } from "googleapis";

const drive = google.drive({ version: "v3" });

async function init() {
    // Initialize TagIDs from drive
    tags = [];
    // Initialize FileIDs from drive
    files = [];
}

/*
 * Creates a tag with the given name, color, and parent tags.
 * @param name The name of the tag.
 * @param color The color of the tag, as a valid CSS color.
 * @param parents The parent tags of the tag, individually separated by new lines.
 * @returns True if the tag was created successfully, false otherwise.
 */
function createTag(name: string, color: string, parents: string): boolean {
    return true;
}

function getTagByID(id: string): FileElement {
    if (id in filesDict) {
        return filesDict[id];
    }
    const file = drive.files.get({ fileId: id });
    filesDict[id] = {
        name: "",
        thumbnail: "",
        filetype: "",
        tags: [],
    };
    return filesDict[id];
}

function search(query: string): FileID[] {
    // Initialize Fuse,
    // 0.1 is a reasonable threshold for "exact match" and about 0.5 feels reasonable for "fuzzy match"
    fuse = new Fuse(tags, {
        keys: ["name", "aliases"],
    });
}
