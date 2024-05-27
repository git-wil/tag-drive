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
import google_modular from "./drive/google_modular";
import { GoogleFile } from "./drive/types";
import { get_drive_list } from "./drive/google_helpers";
import { authorize } from "./drive/auth";
import { FileCard, TagSearchBox } from "./tag/tag";
import { Tag } from "./tag/types";

// For some reason the file list api needs to run twice to render properly
let initialized = 2;


/*
TODO:
- figure out tags lol
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
    // Setup states
    const [selectedFile, setSelectedFile] = useState<GoogleFile>();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    // Create a list with 15 null elements
    const [files, setFiles] = useState<GoogleFile[]>(Array(30).fill(null));

    if (initialized > 0) {
        google_modular.files.list({
            pageSize: 20,
        }).then((response) => {
            console.log(response.files[0])
            setFiles(response.files);
        });
        initialized -=1;
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
                                onClick={() => {
                                    console.log("Filler Button Clicked");
                                    const new_files = [...files];
                                    new_files[0] = {
                                        id: "0",
                                        name: "File0",
                                        thumbnailLink: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg",
                                        mimeType: "image/jpeg"
                                    }
                                    setFiles(new_files);
                                    console.log(files);
                                }}
                                >Filler Button</Button>
                            </div>
                            <div className="col-span-1">
                                <Button className="w-full">Filler Button 2</Button>
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
