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
import google_modular from "../drive/google_modular";
import { GoogleFile } from "../drive/google_types";
import { delete_old_tag_files, get_drive_list, get_file_list, get_tag_file_data, get_tag_file_metadata, save_tag_file } from "../drive/google_helpers";
import { authorize } from "../drive/auth";
import { FileCard, TagSearchBox } from "../tag/tag_display";
import { Tag } from "../tag/tag_types";

// import { files, setFiles, selectedFile, setSelectedFile, tags, setTags, StateManager } from "../StateManager";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import { getFiles, getFilesLoaded, setFiles, setFilesLoaded } from "../drive/files_slice";
import { getTagFileID, getTagFileMetadata, getTags, setTagFileID, setTagFileMetaData, setTags } from "../tag/tags_slice";

let initialized = false;

const drive_id = "";


/*
TODO Editor:
- figure out tags lol
    - i guess just modify tag file as a google doc
- list files from only specific drive, not just my drive
- make searching work
- sidebar (single click)
    - show thumbnail, full name, tags
    - add tags
    - create new tag
- double click to open file with weblink
- adaptive rendering of ~30 files at a time as you scroll
- consider what to show if a file has no tags
- buttons at top right (create new file? sign out/switch drive?)
*/



function Editor() {
    const selectedFile = null;
    const dispatch = useAppDispatch()
    const files = useAppSelector(getFiles)
    const tags = useAppSelector(getTags)
    const tag_file_id = useAppSelector(getTagFileID)
    const tag_file_metadata = useAppSelector(getTagFileMetadata)

    if (!initialized) {
        // Replace with real drive_id
        get_tag_file_metadata(drive_id).then((metadata) => {
            console.log("Got metadata", metadata)
            dispatch(setTagFileMetaData(metadata));
            get_tag_file_data(metadata).then((data) => {
                console.log("Got data", data);
                dispatch(setTags(data));
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
            <div className="flex align-middle justify-center">
                <Card
                    isBlurred
                    shadow="sm"
                    fullWidth
                    className="border-none bg-background/60 dark:bg-default-100/50"
                >
                    <CardBody>
                        <div className="grid grid-cols-8 gap-2 items-center justify-center">
                            <div className="col-span-6">
                                <TagSearchBox/>
                                {/* <TagSearchBox
                                    selectedKeys={selectedTags} 
                                    setSelectedKeys={setSelectedTags}
                                    tags={tags}/> */}
                            </div>
                            <div className="col-span-1 h-full">
                                <Button
                                className="w-full h-full"
                                onClick={async () => {
                                    console.log("Filler Button Clicked");
                                }}
                                >Filler Button</Button>
                            </div>
                            <div className="col-span-1 h-full">
                                <Button
                                className="w-full h-full"
                                onClick={async () => {
                                    console.log("Filler Button 2 Clicked");
                                }}
                                >Filler Button 2</Button>
                            </div>
                            <Card className="overflow-auto col-span-6 border-none bg-background/60 dark:bg-default-100/50 h-[780px] rounded-3xl">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 items-center justify-center p-2">
                                    {
                                        files.map((item) => {
                                            return (
                                                <FileCard file={item}/>
                                            );
                                        })
                                    }
                                </div>
                            </Card>
                            <Card className="col-span-2 space-y-5 p-4 h-full" radius="lg">
                                <div className="w-full lg:h-[200px] md:h-[150px] sm:h-[100px] rounded-lg bg-default-300"></div>
                                <Button
                                    className="w-full"
                                    onClick={async () => {
                                        console.log("Get Tag File Metadata Clicked");
                                        const tag_file = await get_tag_file_metadata(drive_id);
                                        dispatch(setTagFileID(await tag_file.id));
                                        dispatch(setTagFileMetaData(await tag_file));
                                        console.log(await tag_file);
                                    }}
                                    >Get Tag File Metadata</Button>
                                <Button
                                    className="w-full"
                                    onClick={async () => {
                                        console.log("Get Tag File Data Clicked");
                                        console.log("Tags", tags);
                                        const tag_file_data = await get_tag_file_data(tag_file_metadata);
                                        console.log(await tag_file_data);
                                    }}
                                    >Get Tag File Data</Button>
                                <Button
                                    className="w-full"
                                    onClick={async () => {
                                        console.log("Save Tag File Clicked");
                                        console.log("Tags", tags);
                                        await save_tag_file(tags, tag_file_metadata, drive_id);
                                        const new_tag_file = await get_tag_file_metadata(drive_id);
                                        dispatch(setTagFileMetaData(await new_tag_file));
                                        console.log("New tag file", await new_tag_file);
                                    }}
                                    >Save Tag File</Button>
                                <Button
                                    className="w-full"
                                    onClick={async () => {
                                        console.log("Delete Tag File Clicked");
                                        await delete_old_tag_files(drive_id);
                                        console.log("Deleted")
                                    }}
                                    >Delete Tag File</Button>

                                {selectedFile !== null
                                    ? <div className="w-full lg:h-350 md:h-200 sm:h-50 rounded-lg bg-default-300"></div>
                                    : null}
                                <div className="space-y-3">
                                    <Skeleton className="w-3/5 rounded-sm">
                                    <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                                    </Skeleton>
                                    <Skeleton className="w-4/5 rounded-lg">
                                    <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                                    </Skeleton>
                                    <Skeleton className="w-2/5 rounded-lg">  
                                    <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                                    </Skeleton>
                                </div>
                            </Card>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

export default Editor;
