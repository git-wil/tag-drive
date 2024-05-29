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
import { getFiles, setFiles } from "../drive/files_slice";
import { getTagFileID, getTagFileMetadata, getTags, setTagFileID, setTagFileMetaData } from "../tag/tags_slice";

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
        get_file_list(drive_id).then((response) => {
            console.log("running");
            dispatch(setFiles(response.files));
            // setFiles(response.files);
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
                            <div className="col-span-1">
                                <Button
                                className="w-full"
                                onClick={async () => {
                                    // console.log("Filler Button Clicked");
                                    // const new_files = [...files];
                                    // new_files[0] = {
                                    //     id: "0",
                                    //     name: "File0",
                                    //     kind: "drive#file",
                                    //     hasThumbnail: true,
                                    //     thumbnailLink: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg",
                                    //     mimeType: "image/jpeg",
                                    //     fileExtension: "jpg",
                                    //     webViewLink: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg",
                                    //     iconLink: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg",
                                    //     driveId: undefined,
                                    // }
                                    // setFiles(new_files);
                                    // console.log(files);

                                    // CREATE NEW TAG FILE
                                    // console.log("Filler Button Clicked");
                                    // const new_tag_file = await create_tag_file(drive_id);
                                    // console.log(await new_tag_file);

                                    // DELETE TAG FILES
                                    // const tag_files = await get_tag_file(drive_id);
                                    // await tag_files.files.map((tag_file) => {
                                    //     console.log("Deleting file", tag_file);
                                    //     google_modular.files.delete(tag_file.id, {supportsAllDrives: true});
                                    // });
                                    // console.log("Tag Files Created deleted");

                                    // Create google drive text file
                                    // const fileData = "Hello World!";
                                    // const fileMetadata: GoogleFile = {
                                    //     name: "HelloWorld.txt",
                                    //     parents: [drive_id || "root"],
                                    //     mimeType: 'text/plain',
                                    // };
                                    // const result = await google_modular.files.create(fileData, fileMetadata, {
                                    //     supportsAllDrives: true,
                                    // });
                                    //console.log(await result);
                                    const test_file = await google_modular.files.list({
                                        corpora: "user",
                                        driveId: "",
                                        pageSize: 1,
                                        q: `name contains 'testfile' and trashed=false`,
                                        fields: "files(*)",
                                        supportsAllDrives: true,
                                    });
                                    console.log("Test File result", await test_file);
                                    const id = await test_file.files[0].id;
                                    // const id = "1nKiOV08z48_BICkQ47ZMUNuHc32DVgSX"//await result.id;
                                    console.log("ID", id);
                                    const file_meta = await google_modular.files.get_metadata(id, {supportsAllDrives: true});
                                    console.log("Stored meta", await file_meta);
                                    const file = await google_modular.files.get_data(id, {supportsAllDrives: true});
                                    const body = await file.body;
                                    console.log("Stored file", new TextDecoder().decode(body.getReader().read().buffer) + "'");
                                }}
                                >Filler Button</Button>
                            </div>
                            <div className="col-span-1">
                                <Button
                                className="w-full"
                                onClick={async () => {
                                    // GET TAG FILE
                                    console.log("Filler Button 2 Clicked");
                                    const tag_file = await get_tag_file_metadata(drive_id);
                                    console.log(await tag_file);
                                }}
                                >Filler Button 2</Button>
                            </div>
                            <Card className="overflow-auto col-span-6 border-none bg-background/60 dark:bg-default-100/50 h-[780px] rounded-3xl">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 items-center justify-center p-2">
                                    {/* <Card className="col-span-1 space-y-5 p-4" radius="md">
                                        <Skeleton className="rounded-lg">
                                            <div className="h-24 rounded-lg bg-default-300"></div>
                                        </Skeleton>
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
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card>
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card>
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card>
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card>
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card>
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card>
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card>
                                    <Card className="col-span-1 space-y-5 p-4" radius="lg"></Card> */}
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
                                        await save_tag_file(tags, tag_file_id, tag_file_metadata, drive_id);
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
