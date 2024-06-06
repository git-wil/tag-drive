import "./Editor.css";
import {
    Card,
} from "@nextui-org/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";


import { get_file_list, get_tag_file_data, get_tag_file_metadata } from "../drive/google_helpers";
import { FileCardContainer, FileSearchBox, TagPanel } from "../tag/tag_display";

// import { files, setFiles, selectedFile, setSelectedFile, tags, setTags, StateManager } from "../StateManager";

import { clearSelectedFiles, getDragging, getQueriedFiles, getVisibleFiles, resetDraggedOver, setFiles, setFilesLoaded, setQueriedFiles, setVisibleFiles } from "../drive/files_slice";
import { getTagMetadata, setFileTags, setQueriedTags, setTagFileMetaData, setTagMetadata } from "../tag/tags_slice";
import { TagFile } from "../tag/tag_types";


let initialized = false;

const drive_id = ""; // "0AH0hueN2V6xzUk9PVA";



/*
TODO Editor:
✔ figure out tags lol 
    ✔ i guess just modify tag file as a google doc
✔ list files from only specific drive, not just my drive
✔ goodbye old sidebar for files
✔ hello new sidebar for tags
    ✔ tag panel (list of all tags, children tags are indented under parents like a tree)
    - tools bar (bomb to delete all tags, dynamite to delete one color (whatever tag is hovered))
    - tag search bar (fuse, shows all tags that match search)
    ✔ plus button to open new tag modal
- modal for new tag creation
    - name
    - color
    - aliases (optional)
    - parent tag (optional, otherwise "" for root)
    - children tags (optional)
✔ make searching work
    - Think about exact match/parentheses matching with & and |?
✔ double click to open file with weblink
✔ adaptive rendering of ~30 files at a time as you scroll
- consider what to show if a file has no tags
- buttons at top left (create new file? sign out/switch drive?)
- export tag metadata (no files) and import (between drives)
½ make keyboard shortcuts for everything


Old:
✖ sidebar (single click) 
    - show thumbnail, full name, tags ✔
    - add tags
    - create new tag
*/


function EditorNew() {
    const dispatch = useAppDispatch();
    const visible_files = useAppSelector(getVisibleFiles);
    const queried_files = useAppSelector(getQueriedFiles);
    const dragging = useAppSelector(getDragging);
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
                get_file_list(drive_id).then((files) => {
                    console.log("running", typeof files, files);
                    dispatch(setFiles(files));
                    dispatch(setQueriedFiles(files));
                    dispatch(setQueriedTags(Object.values(data.TAG_DATA)));
                    dispatch(setFilesLoaded(true));
                });
            });
        });
        initialized = true;
    }

    return (
        <>  
            <div className="align-middle justify-center h-screen p-8"
            onClick={()=>{
                dispatch(clearSelectedFiles());
            }}
            >
                <Card
                    isBlurred
                    shadow="sm"
                    fullWidth
                    className="bg-background/60 h-full p-3 overflow-visible"
                >
                    <div className="grid grid-rows-6 grid-cols-1 sm:grid-rows-none sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-4 2xl:grid-cols-5 gap-2 items-center justify-center h-full w-full">
                        <div
                        id="control-panel"
                        onDragEnter={(e) => {
                            // Reset dragged over items when dragged into the control panel
                            if (dragging.type == "tag") {
                                e.preventDefault();
                                dispatch(resetDraggedOver());
                            }
                        }}
                        className="relative flex flex-col overflow-auto gap-2 row-span-2 w-full order-last sm:order-first sm:row-auto sm:col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-1 2xl:grid-cols-1 h-full">
                            <div
                            id="tag-search-bar"
                            className="w-full h-[80px] flex-none bg-primary-200 rounded-lg"></div>
                            <div
                            id="tag-search-bar"
                            className="w-full h-[60px] flex-none bg-primary-300 rounded-lg"></div>
                            <TagPanel/>
                            <div
                            id="tag-end-bar"
                            className="w-full h-[80px] flex-none bg-primary-200"></div>
                        </div>
                        <div
                        id="main-panel"
                        className="flex flex-col gap-2 sm:tag overflow-auto row-span-4 sm:row-auto sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-3 2xl:col-span-4 w-full h-full">
                            <div className="w-full h-fit flex-none">
                                <FileSearchBox/>
                            </div>
                            <div
                            id="super-file-card-container"
                            onScroll={(e) => {
                                // @ts-expect-error - This event target always has these properties
                                const { scrollTop, scrollHeight, clientHeight } = e.target;
                                const position = Math.ceil(
                                    (scrollTop / (scrollHeight - clientHeight)) * 100
                                );
                                if (position > 75 && visible_files < queried_files.length) {
                                    // Load more files
                                    dispatch(setVisibleFiles(visible_files + 30));
                                }
                            }}
                            className="w-full h-full flex-1 overflow-y-scroll rounded-3xl bg-background/60">
                                <FileCardContainer></FileCardContainer>
                            </div>
                            
                        </div>
                    </div>
                    {/* <div className="grid grid-cols-12 gap-2 items-center justify-center h-full w-full">
                        <div 
                            id="left-panel"
                            className="col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2 grid grid-cols-2 gap-2 h-full w-full bg-default-200">
                        </div>
                        <div 
                            id="right-panel"
                            className="col-span-6 md:col-span-8 lg:col-span-9 xl:col-span-10 w-full h-full bg-default-100">
                        </div>
                    </div> */}
                </Card>
            </div>
        </>
    );
}

export default EditorNew;
