import "./Editor.css";
import {
    Button,
    Card,
    Spinner,
} from "@nextui-org/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";


import { create_tag_sheet, value_range_factory, get_file_list, get_tag_file_data, get_tag_file_metadata, get_tag_sheet_data, get_tag_sheet_id, parse_file_data_from_sheet_values, parse_tag_data_from_sheet_values, parse_values_from_spreadsheet, save_tag_file, update_tag_sheet_values, create_tag_rows, generate_tag_ids } from "../drive/google_helpers";
import { FileCardContainer, FileSearchBox,TagPanel, TagSearchBox } from "../tag/tag_display";

// import { files, setFiles, selectedFile, setSelectedFile, tags, setTags, StateManager } from "../StateManager";

import { clearSelectedFiles, getDragging, getFilesLoaded, getLoadingModal, getQueriedFiles, getVisibleFiles, resetDraggedOver, setFiles, setFilesLoaded, setLoadingModal, setQueriedFiles, setVisibleFiles } from "../store/slice_files.ts";
import { getFileTags, getTagFileMetadata, getTagMetadata, getModified, setFileTags, setQueriedTags, setTagFileMetaData, setTagMetadata, setModified } from "../store/slice_tags.ts";
import { useHotkeys } from "react-hotkeys-hook";
import { AnimatePresence, motion } from "framer-motion";
import { TagList } from "../tag/tag_types";


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
- consider searching by folder name
    - involves accepting folders in get_drive_files
- consider searching by file type
- consider stripping ending ' to make search surrounded by single quotes be exact
    - could also replace double quotes with single quotes
- consider making loading bar instead of spinner that is based on previous
  size of drive split into thousands that updates as every thousand loads
- more tag colors/customization (material icons?)



TODO Hosting:
- make pages /editor and /privacy work without needing to show /editor.html

To update hosting:
run `yarn build` in the tagdrive directory
run `node_modules/.bin/firebase deploy --only hosting` in the tagdrive directory




TODO IMPORTANT
✔ delete tags
✔ switch drives
✔ log out
- how to use
- hover or click tag to see information (aliases, parent, children)
- IMPLEMENT AUTO SAVE (action then inaction method)
  - Action then inaction method:
    - If modified is true, start timeout for 200ms
    - Interrupt timeout if modified again
    - after 200ms has passed, save tag file
- Cached loading
  - Every time tag file saves, save a copy to local storage
  - When page loads, first load local storage copy
  - Queue loading of files from google drive
  - Disable tag sidebar until files are loaded
  - Disable tag drag and drop until files are loaded (from sidebar and from file card)
  - Show loading bar at bottom of screen
  - 
- Change from doc storage to sheet storage
  ✔ get sheet api working
  ✔ Create sheet if it doesn't exist
      ✔ Tags sheet
      ✔ Files sheet
  ✔ Get all data from both sheets
  ✔ Parse data into tag and file objects
  - As edit
      - If files get tags, modify locally stored file search string, etc.
      - If tags get edited, update locally stored file search strings with that tag
      - Add these to the modification queue
      - Compile list of modifications...
      - Tags by UID
          - Modification type (edit, delete, create)
          - If tag was created before last save, change the information in the "create" mod, don't add an edit mod on top
      - Files by GID
          - Modification type (edit, delete, create) 
  - On save,
      - Tags
        - Edit existing tags by named range in Tags sheet
        ✔ Create new tags by appending to Tags sheet and creating named ranges by UID
        - Delete tags by deleting named range and then deleting row
      - Files
        - Create new files by appending to Files sheet with GID and tags/search strings
        - Delete files that are marked for deletion (have no tags, or that are in sheet but no longer in google drive)







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

    window.onbeforeunload = (e) => {
        if (is_modified) {    
            save_tag_file({TAG_DATA: tags, FILE_DATA: file_tags}, tag_file_metadata, drive_id).then(() => {
                console.log("Saved");
                dispatch(setModified(false));
            });
            const event = e || window.event
            if (event) {
                event.returnValue = "You have unsaved changes. Are you sure you want to leave?"
            }
            return "You have unsaved changes. Are you sure you want to leave?"
        }
        
    };

    if (!initialized) {
        dispatch(setLoadingModal({open: true, message: "Loading tag file..."}))
        // Load tags and files
        // create_tag_sheet(drive_id).then((sheet_id) => {
        //     console.log("Got tag sheet id", sheet_id)
        // });
        get_tag_sheet_id(drive_id).then((sheet_id) => {
            get_tag_sheet_data(sheet_id).then((sheet) => {
                console.log("Got tag sheet data", sheet);
                const data = parse_values_from_spreadsheet(sheet);
                console.log("Tag data:", parse_tag_data_from_sheet_values(data));
                console.log("File data:", parse_file_data_from_sheet_values(data));
                // const uuids = generate_tag_ids(2);
                // const test_tags: TagList = {};
                // test_tags[uuids[0]] = {
                //         id: uuids[0],
                //         name: "This Tag",
                //         color: "red-800",
                //         icon: "",
                //         aliases: [],
                //         parent: "",
                //         children: []
                //     },
                // test_tags[uuids[1]] = {
                //     id: uuids[1],
                //     name: "Another tag",
                //     color: "cyan-800",
                //     icon: "tagger",
                //     aliases: ["Alias 1", "Alias 2"],
                //     parent: "0",
                //     children: ["2", "1"]
                // }
                // create_tag_rows(sheet, test_tags).then((result) => {
                //     console.log("Created tags", result);
                // });
            });
        });
        // get_tag_file_metadata(drive_id).then((metadata) => {
        //     console.log("Got metadata", metadata)
        //     dispatch(setTagFileMetaData(metadata));
        //     dispatch(setLoadingModal({open: true, message: "Loading tag data..."}))
        //     get_tag_file_data(metadata).then((data: TagFile) => {
        //         console.log("Got data", data);
        //         dispatch(setTagMetadata(data.TAG_DATA));
        //         dispatch(setFileTags(data.FILE_DATA));
        //         dispatch(setLoadingModal({open: true, message: "Loading files..."}))
        //         get_file_list(drive_id).then((files) => {
        //             dispatch(setFiles(files));
        //             dispatch(setQueriedFiles(files));
        //             dispatch(setQueriedTags(Object.values(data.TAG_DATA)));
        //             dispatch(setFilesLoaded(true));
        //             dispatch(setLoadingModal({open: false, message: "Done"}))
        //         });
        //     });
        // });
        initialized = true;
    }

    const SHORTCUT_KEYS = [
        "meta+s",
        "ctrl+s",
        "/"
    ]

    const ref = useHotkeys(SHORTCUT_KEYS, (_, handler) => {
        if (!handler || !handler.keys) return;

        const shortcut = handler.keys.join("");
        
        if (shortcut == "/") {
            document.getElementById("fileSearchBox")?.focus();
        }
        if (shortcut == "s" && (handler.meta || handler.ctrl)) {
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
        }
    }, { preventDefault: true })

    return (
        <>  
            {/* @ts-expect-error This is a valid ref, its from the useHotkeys hook and is designed to be used this way */}
            <div className="align-middle justify-center h-dvh p-8" ref={ref} tabIndex={-1}
            onClick={()=>{
                // Clear selected files when clicking outside of the file panel
                dispatch(clearSelectedFiles());
            }}
            >
                <AnimatePresence>
                    {loading_modal.message && <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: (loading_modal.open) ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        onAnimationComplete={() => {
                            if (!loading_modal.open) {
                                dispatch(setLoadingModal({open: false, message: ""}));
                            }
                        }}
                        className="shadow-md shadow-primary-50 absolute m-auto left-0 right-0 top-0 bottom-0 w-3/4 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 z-50 h-fit flex items-center justify-center rounded-2xl"
                    >
                        <div
                            className="h-full w-full p-5 flex items-center justify-center rounded-2xl bg-primary-900/95"
                        >
                        <h1 className="text-2xl text-primary pe-5 select-none">{loading_modal.message}</h1>
                        <Spinner size="lg" color="primary" />
                        </div>
                    </motion.div>}
                </AnimatePresence>
                <Card
                    isBlurred
                    shadow="sm"
                    fullWidth
                    className="bg-background/60 h-full p-3 overflow-visible"
                >
                    <div className="grid grid-rows-5 grid-cols-1 sm:grid-rows-none sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-4 2xl:grid-cols-5 gap-2 items-center justify-center h-full w-full">
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
                            <TagSearchBox/>
                            <div className="w-full h-full flex-1 overflow-auto">
                                <TagPanel/>
                            </div>
                        </div>
                        <div
                        id="main-panel"
                        className="flex flex-col gap-2 overflow-auto row-span-3 sm:row-auto sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-3 2xl:col-span-4 w-full h-full">
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
                </Card>
            </div>
        </>
    );
}

export default EditorNew;
