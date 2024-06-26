import "./Editor.css";
import {
    Button,
    Card,
    Spinner,
} from "@nextui-org/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";


import { get_file_list, get_tag_file_data, get_tag_file_metadata, save_tag_file } from "../drive/google_helpers";
import { FileCardContainer, FileSearchBox,TagPanel, TagSearchBox } from "../tag/tag_display";

// import { files, setFiles, selectedFile, setSelectedFile, tags, setTags, StateManager } from "../StateManager";

import { clearSelectedFiles, getDragging, getFilesLoaded, getLoadingModal, getQueriedFiles, getVisibleFiles, resetDraggedOver, setFiles, setFilesLoaded, setLoadingModal, setQueriedFiles, setVisibleFiles } from "../drive/files_slice";
import { getFileTags, getTagFileMetadata, getTagMetadata, getModified, setFileTags, setQueriedTags, setTagFileMetaData, setTagMetadata, setModified } from "../tag/tags_slice";
import { TagFile } from "../tag/tag_types";
import { useHotkeys } from "react-hotkeys-hook";
import { AnimatePresence, motion } from "framer-motion";


let initialized = false;

// const drive_id = ""; // "0AH0hueN2V6xzUk9PVA";



/*
TODO Editor:
✔ figure out tags lol 
    ✔ i guess just modify tag file as a google doc
✔ list files from only specific drive, not just my drive
✔ save tag file to google drive
✔ goodbye old sidebar for files
✔ hello new sidebar for tags
    ✔ tag panel (list of all tags, children tags are indented under parents like a tree)
    ✖ tools bar (bomb to delete all tags, dynamite to delete one color (whatever tag is hovered))
    ✔ tag search bar (fuse, shows all tags that match search)
    ✔ plus button to open new tag modal
✔ modal for new tag creation
    ✔ name
    ✔ color
    ✔ aliases (optional)
    ✔ parent tag (optional, otherwise "" for root)
    ✔ children tags (optional)
✔ make searching work
    - Think about exact match/parentheses matching with & and |?
✔ double click to open file with weblink
✔ adaptive rendering of ~30 files at a time as you scroll
- consider what to show if a file has no tags
½ buttons at top left (create new file? sign out/switch drive?)
- export tag metadata (no files) and import (between drives)
½ make keyboard shortcuts for everything
✔ make tag create button skeleton
✔ double click tags to edit
✔ drag tag to delete
✔ tag search bar
- consider modifying tag name
- consider searching by parent name
    - involves accepting folders in get_drive_files
- consider searching by file type
- consider stripping ending ' to make search surrounded by single quotes be exact
    - could also replace double quotes with single quotes
- consider making loading bar instead of spinner that is based on previous
  size of drive split into thousands that updates as every thousand loads

TODO Hosting:
- make pages /editor and /privacy work without needing to show /editor.html


IMPORTANT
✔ delete tags
✔ switch drives
✔ log out
- hover or click tag to see information (aliases, parent, children)




Old:
✖ sidebar (single click) 
    ✖ show thumbnail, full name, tags ✔
    ✖ add tags
    ✖ create new tag
*/


function EditorNew() {
    const dispatch = useAppDispatch();

    const drive_id = localStorage.getItem("drive") || "";

    const visible_files = useAppSelector(getVisibleFiles);
    const queried_files = useAppSelector(getQueriedFiles);
    const dragging = useAppSelector(getDragging);
    const tags = useAppSelector(getTagMetadata);
    const file_tags = useAppSelector(getFileTags);
    const tag_file_metadata = useAppSelector(getTagFileMetadata);
    const loading_modal = useAppSelector(getLoadingModal);
    const is_modified = useAppSelector(getModified);
    const files_loaded = useAppSelector(getFilesLoaded);
    // const tag_file_id = useAppSelector(getTagFileID)
    // const tag_file_metadata = useAppSelector(getTagFileMetadata)

    window.onbeforeunload = () => {
        if (is_modified) {
            save_tag_file({TAG_DATA: tags, FILE_DATA: file_tags}, tag_file_metadata, drive_id)
            for (let i = 0; i < 300000000; i++) {
                // Wait for save
            }
        }
        // const event = e || window.event
        // if (event) {
        //     event.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        // }
        // return "You have unsaved changes. Are you sure you want to leave?"
    };

    if (!initialized) {
        dispatch(setLoadingModal({open: true, message: "Loading tag file..."}))
        // Load tags and files
        get_tag_file_metadata(drive_id).then((metadata) => {
            console.log("Got metadata", metadata)
            dispatch(setTagFileMetaData(metadata));
            dispatch(setLoadingModal({open: true, message: "Loading tag data..."}))
            get_tag_file_data(metadata).then((data: TagFile) => {
                console.log("Got data", data);
                dispatch(setTagMetadata(data.TAG_DATA));
                dispatch(setFileTags(data.FILE_DATA));
                dispatch(setLoadingModal({open: true, message: "Loading files..."}))
                get_file_list(drive_id).then((files) => {
                    dispatch(setFiles(files));
                    dispatch(setQueriedFiles(files));
                    dispatch(setQueriedTags(Object.values(data.TAG_DATA)));
                    dispatch(setFilesLoaded(true));
                    dispatch(setLoadingModal({open: false, message: "Done"}))
                });
            });
        });
        initialized = true;
    }
    const ref = useHotkeys("ctrl+s", (_, handler) => {
        if (!handler || !handler.keys) return;
        console.log("Saving");
        dispatch(setLoadingModal({open: true, message: "Saving..."}));
        // Save tag file to google drive
        if (is_modified) {
            save_tag_file({TAG_DATA: tags, FILE_DATA: file_tags}, tag_file_metadata, drive_id).then((result) => {
                console.log("Saved", result);
                dispatch(setLoadingModal({open: false, message: "Saving..."}));
                dispatch(setModified(false));
            });
        }
    }, { preventDefault: true })

    return (
        <>  
            {/* @ts-expect-error This is a valid ref, its from the useHotkeys hook and is designed to be used this way */}
            <div className="align-middle justify-center h-screen p-8" ref={ref} tabIndex={-1}
            onClick={()=>{
                dispatch(clearSelectedFiles());
            }}
            >
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: (loading_modal.open) ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        className="shadow-md shadow-primary-50 absolute m-auto left-0 right-0 top-0 bottom-0 w-1/4 z-50 h-fit flex items-center justify-center rounded-2xl"
                    >
                        <div
                            className="h-full w-full p-5 flex items-center justify-center rounded-2xl bg-primary-900/95"
                        >
                        <h1 className="text-2xl text-primary pe-5 select-none">{loading_modal.message}</h1>
                        <Spinner size="lg" color="primary" />
                        </div>
                    </motion.div>
                </AnimatePresence>
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
                            className="w-full h-fit flex-none flex flex-row gap-2 rounded-lg">
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="ghost"
                                    isDisabled={!files_loaded}
                                    className="text-primary-800 w-2/5 bg-primary-200 h-[50px] text-[0.92rem]"
                                    onClick={() => {
                                        if (is_modified) {
                                            dispatch(setLoadingModal({open: true, message: "Saving..."}));
                                            save_tag_file({TAG_DATA: tags, FILE_DATA: file_tags}, tag_file_metadata, drive_id).then((result) => {
                                                console.log("Saved", result);
                                                dispatch(setModified(false));
                                                window.location.href = "/index.html";
                                            });
                                        } else {
                                            window.location.href = "/index.html";
                                        }
                                    }}
                                >
                                    Switch Drive
                                </Button>
                                <Button
                                    fullWidth
                                    isDisabled
                                    color="primary"
                                    variant="ghost"
                                    className="text-primary-800 w-3/5 bg-primary-200 h-[50px] text-[0.92rem]"
                                >
                                    Create New File
                                </Button>
                            </div>
                            {/* <div
                            id="tag-search-bar"
                            className="w-full h-[60px] flex-none bg-primary-300 rounded-lg"></div> */}
                            <TagSearchBox/>
                            <div className="w-full h-full flex-1 overflow-auto">
                                <TagPanel/>
                            </div>
                        </div>
                        <div
                        id="main-panel"
                        className="flex flex-col gap-2 overflow-auto row-span-4 sm:row-auto sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-3 2xl:col-span-4 w-full h-full">
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
                            className="w-full h-full flex-1 overflow-y-scroll rounded-3xl bg-primary-50">
                                <FileCardContainer/>
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
