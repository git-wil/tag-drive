import { useState } from "react";
import "./Editor.css";
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    CardBody,
    Select,
    SelectItem,
    Slider,
    Image,
    Spacer,
    Skeleton,
} from "@nextui-org/react";
import google_modular from "./src/drive/google_modular";
import { GoogleFile } from "./src/drive/google_types";
import { delete_tag_files_in_drive, get_drive_list, get_file_list, get_tag_file_data, get_tag_file_metadata, save_tag_file } from "./src/drive/google_helpers";
import { authorize } from "./src/drive/auth";
import { FileCard, TagSearchBox } from "./src/tag/tag_display";

// import { files, setFiles, selectedFile, setSelectedFile, tags, setTags, StateManager } from "../StateManager";

import { useAppSelector, useAppDispatch } from "./src/store/hooks";
import { clearSelectedFiles, getFiles, setFiles, setFilesLoaded } from "./src/drive/files_slice";
import { setFileTags, setTagFileMetaData, setTagMetadata } from "./src/tag/tags_slice";
// import { Sidebar } from "./sidebar";
import { TagFile } from "./src/tag/tag_types";

let initialized = false;

const drive_id = "";



/*
TODO Editor:
- figure out tags lol ✔
    - i guess just modify tag file as a google doc ✔
- list files from only specific drive, not just my drive ✔ (not working)
- goodbye old sidebar
- hello new sidebar
    - tag panel (list of all tags, children tags are indented under parents like a tree)
    - tools bar (bomb to delete all tags, dynamite to delete one color (whatever tag is hovered))
    - tag search bar (fuse, shows all tags that match search)
    - plus button to open new tag modal
- modal for new tag creation
    - name
    - color
    - parent tag (optional)
    - aliases (optional)

- sidebar (single click) 
    - show thumbnail, full name, tags ✔
    - add tags
    - create new tag
- make searching work
- double click to open file with weblink ✔
- adaptive rendering of ~30 files at a time as you scroll
- consider what to show if a file has no tags
- buttons at top right (create new file? sign out/switch drive?)
- export tag metadata (no files) and import (between drives)
- make keyboard shortcuts for everything
*/


function Editor() {
    const dispatch = useAppDispatch();
    const files = useAppSelector(getFiles);
    // const tags = useAppSelector(getTags)
    // const tag_file_id = useAppSelector(getTagFileID)
    // const tag_file_metadata = useAppSelector(getTagFileMetadata)

    if (!initialized) {
        // Load tags and files
        get_tag_file_metadata(drive_id).then((metadata) => {
            console.log("Got metadata", metadata)
            dispatch(setTagFileMetaData(metadata));
            get_tag_file_data(metadata).then((data: TagFile) => {
                console.log("Got data", data);
                dispatch(setTagMetadata(data.TAG_DATA));
                dispatch(setFileTags(data.FILE_DATA));
                get_file_list(drive_id).then((response) => {
                    console.log("running");
                    dispatch(setFiles(response.files));
                    dispatch(setFilesLoaded(true));
                });
            });
        });
        initialized = true;
    }

    return (
        <>  
            <div className="align-middle justify-center h-full p-8"
            onClick={()=>{
                dispatch(clearSelectedFiles());
            }}>
                <Card
                    isBlurred
                    shadow="sm"
                    fullWidth
                    className="border-none bg-background/60 dark:bg-default-100/50 h-full"
                >
                    <CardBody>
                        <div className="grid grid-cols-12 gap-2 items-center justify-center">
                            <div 
                              id="search-bar"
                              className="col-span-6 md:col-span-8 lg:col-span-9 xl:col-span-10 w-full h-full">
                                <TagSearchBox/>
                                {/* <TagSearchBox
                                    selectedKeys={selectedTags} 
                                    setSelectedKeys={setSelectedTags}
                                    tags={tags}/> */}
                            </div>
                            <div 
                              id="button-bar"
                              className="grid grid-cols-2 gap-2 h-full col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
                                <div className="col-span-1 h-full">

                                <Button
                                    className="w-full h-full"
                                    onClick={async () => {
                                        console.log("Filler Button 1 Clicked");
                                        await delete_tag_files_in_drive(drive_id);
                                        console.log("Deleted files");
                                    }}
                                    >Filler Button 1</Button>
                                </div>
                                <div className="col-span-1 h-full">
                                    <Button
                                    className="w-full h-full"
                                    onClick={async () => {
                                        console.log("Filler Button 2 Clicked");
                                    }}
                                    >Filler Button 2</Button>
                                </div>
                            </div>
                            <Card
                              id= "file-list"
                              className="overflow-auto scrollbar col-span-6 md:col-span-8 lg:col-span-9 xl:col-span-10 border-none bg-background/60 dark:bg-default-100/50 h-[750px] rounded-3xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-2 items-center justify-center p-2">
                                    {
                                        files.map((item, index) => {
                                            return (
                                                <FileCard file={item} index={index} key={index}/>
                                            );
                                        })
                                    }
                                </div>
                            </Card>
                            <div 
                            id="sidebar"
                            className="col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2 h-full w-full">
                                <Sidebar/>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

export default Editor;
