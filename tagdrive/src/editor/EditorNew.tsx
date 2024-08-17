import "./Editor.css";
import { Button, Card, Progress } from "@nextui-org/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";

import {
    apply_file_modifications,
    apply_tag_modifications,
    get_file_list,
    get_tag_sheet_data,
    get_tag_sheet_id,
    parse_file_data_from_sheet_values,
    parse_tag_data_from_sheet_values,
    parse_values_from_spreadsheet,
} from "../drive/google_helpers";
import {
    TagSidebar,
    TagSearchBox,
    SelectedTagsPopup,
} from "../tag/tag_display";
import { FileCardContainer } from "../file/file_display";

import { FileSearchBox } from "../file/file_display";

// import { files, setFiles, selectedFile, setSelectedFile, tags, setTags, StateManager } from "../StateManager";

// import { clearSelectedFiles, getDragging, getFilesLoaded, getLoadingModal, getQueriedFiles, getVisibleFiles, resetDraggedOver, setFiles, setFilesLoaded, setLoadingModal, setQueriedFiles, setVisibleFiles } from "../store/slice_files_old.ts";
// import { getFileTags, getTagFileMetadata, getTagMetadata, getModified, setFileTags, setQueriedTags, setTagFileMetaData, setTagMetadata, setModified } from "../store/slice_tags_old.ts";
import { useHotkeys } from "react-hotkeys-hook";
import { AnimatePresence, motion } from "framer-motion";
import {
    areDriveFilesLoaded,
    incrementVisibleFileCount,
    isModified,
    queryAllFiles,
    setDriveFiles,
} from "../store/slice_editor";
import {
    clearFileModQueue,
    getFileModQueue,
    setFileTagMap,
} from "../store/slice_files";
import {
    clearTagModQueue,
    getTagModQueue,
    queryAllTags,
    setTagList,
} from "../store/slice_tags";
import {
    clearProgress,
    getProgress,
    initializeProgress,
    updateProgress,
} from "../store/slice_editor";
import {
    getSpreadsheet,
    setSpreadsheet,
    setSpreadsheetId,
} from "../store/slice_spreadsheet";
// import { TagList, TagModification, TagModificationType } from "../tag/tag_types";
// import { FileModification, FileModificationType } from "../file/file_types.ts";

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
      ✔ If files get tags, modify locally stored file search string, etc.
      ✔ If tags get edited, update locally stored file search strings with that tag
      ✔ Add these to the modification queue
      ✔ Compile list of modifications...
      ✔ Tags by UID
          ✔ Modification type (edit, delete, create)
          ✔ If tag was created before last save, change the information in the "create" mod, don't add an edit mod on top
      ✔ Files by GID
          ✔ Modification type (edit, delete, create) 
  - On save,
      - Tags
        ✔ Edit existing tags by named range in Tags sheet
        ✔ Create new tags by appending to Tags sheet and creating named ranges by UID
        ✔ Delete tags by deleting named range and then deleting row
      - Files
        ✔ Create new files by appending to Files sheet with GID and tags/search strings
        - Delete files that are marked for deletion (have no tags, or that are in sheet but no longer in google drive)





Keyboard Shortcuts:
- Ctrl + S: Save
- /: Focus on file search bar
- Alt + /: Focus on tag search bar
- Ctrl + /: Show keyboard shortcuts
- T: Focus on tag panel (for selecting tags)
- F: Focus on file panel (for applying tags)
- Alt + T: Create new tag
- Shift + T: Edit selected tag (if only one tag is selected)
- 1-9: (while focused on tag panel) Assign current selected tag(s) to number (and deselect tags)
     : (while focused on file panel) Add number tags to selected files
- Shift + 1-9: (while focused on tag panel) Add current selected tag(s) to number (and deselect tags)
             : (while focused on file panel) Remove number tags from selected files
- 

To create:
✔ Tags in sidebar are selectable
    - Deselect all?
    - If horizontal lines clicked, open tag in editor modal
- Files in main panel are selectable
- Tags in main panel have a delete button
    - When clicked, show popup to confirm deletion
    - When shift is held, delete without confirmation
- When tags selected, clicking on file will apply tags to file
- When no tags selected, clicking on file will select file





Old:
✖ sidebar (single click) 
    ✖ show thumbnail, full name, tags ✔
    ✖ add tags
    ✖ create new tag
*/

function EditorNew() {
    const dispatch = useAppDispatch();

    const drive_id = localStorage.getItem("drive") || "";

    const is_modified = useAppSelector(isModified);
    const progress_data = useAppSelector(getProgress);
    const tag_mods = useAppSelector(getTagModQueue);
    const file_mods = useAppSelector(getFileModQueue);
    const tag_spreadsheet = useAppSelector(getSpreadsheet);
    const are_drive_files_loaded = useAppSelector(areDriveFilesLoaded);

    window.onload = () => {
        // TODO: Implement cached loading
        const estimate_number_of_file_thousands = 2;
        const progress_steps = 4 + estimate_number_of_file_thousands;
        dispatch(
            initializeProgress({
                steps: progress_steps,
                message: "Getting tag file id...",
            }),
        );

        const create_file_progress_hook = () => {
            dispatch(
                updateProgress({ step: 1, message: "Creating tag file..." }),
            );
        };

        // Load tags and files
        get_tag_sheet_id(drive_id, create_file_progress_hook).then(
            (sheet_id) => {
                console.log("Got tag sheet id", sheet_id);
                dispatch(setSpreadsheetId(sheet_id));
                dispatch(
                    updateProgress({ step: 2, message: "Getting tag data..." }),
                );
                get_tag_sheet_data(sheet_id).then((spreadsheet) => {
                    dispatch(
                        updateProgress({
                            step: 3,
                            message: "Updating tag data...",
                        }),
                    );
                    console.log("Got tag sheet data", spreadsheet);
                    dispatch(setSpreadsheet(spreadsheet));

                    // Intermediary step to parse data
                    const data = parse_values_from_spreadsheet(spreadsheet);

                    const tag_data = parse_tag_data_from_sheet_values(data);
                    console.log("Tag data:", tag_data);
                    dispatch(setTagList(tag_data));

                    const file_data = parse_file_data_from_sheet_values(data);
                    console.log("File data:", file_data);
                    dispatch(setFileTagMap(file_data));

                    // Load files
                    dispatch(
                        updateProgress({
                            step: 4,
                            message: "Loading files...",
                        }),
                    );
                    // Create a hook to update progress when each thousand files is loaded
                    const get_file_progress_hook = (thousand: number) => {
                        if (thousand < estimate_number_of_file_thousands) {
                            dispatch(
                                updateProgress({
                                    step: 4 + thousand,
                                    message: "Loading files...",
                                }),
                            );
                        }
                    };
                    get_file_list(drive_id, get_file_progress_hook).then(
                        (files) => {
                            dispatch(
                                updateProgress({
                                    step: progress_steps,
                                    message: "Loaded!",
                                }),
                            );
                            // Clear progress bar after a second
                            setTimeout(() => {
                                dispatch(clearProgress());
                            }, 1000);
                            console.log("Got files", files);
                            dispatch(setDriveFiles(files));
                            dispatch(queryAllFiles());
                            dispatch(queryAllTags());
                        },
                    );

                    // Create some sample FileModifications
                    // const file_mods: FileModification[] = [];
                    // const uuids = generate_file_ids(2);
                    // const test_g_ids = generate_tag_ids(2);

                    // const alternate_gids = Object.values(file_data).map((file) => file.gid).slice(2, 4)
                    // for (let i = 0; i < alternate_gids.length; i++) {
                    //     file_mods.push({
                    //         type: FileModificationType.DELETE,
                    //         file: {
                    //             sheet_id: file_data[alternate_gids[i]].sheet_id,
                    //             gid: alternate_gids[i],
                    //             tags: [],
                    //             search_string: `Test File ${i} (DELETED!)`
                    //         }
                    //     });
                    // }
                    // for (let i = 0; i < uuids.length; i++) {
                    //     file_mods.push({
                    //         type: FileModificationType.CREATE,
                    //         file: {
                    //             sheet_id: uuids[i],
                    //             gid: test_g_ids[i],
                    //             tags: ["Test"],
                    //             search_string: `Test File ${i} new!`
                    //         }
                    //     });
                    // }
                    // const existing_gids = Object.values(file_data).map((file) => file.gid).slice(0, 2);
                    // for (let i = 0; i < existing_gids.length; i++) {
                    //     file_mods.push({
                    //         type: FileModificationType.UPDATE,
                    //         file: {
                    //             sheet_id: file_data[existing_gids[i]].sheet_id,
                    //             gid: existing_gids[i],
                    //             tags: ["Test"],
                    //             search_string: `Test File ${i} (UPDATED!)`
                    //         }
                    //     });
                    // }
                    // console.log("File modifications", file_mods);
                    // apply_file_modifications(spreadsheet, file_mods).then((result) => {
                    //     console.log("New spreadsheet", result);
                    // });
                    // Create some sample TagModifications
                    // const tag_mods: TagModification[] = [];
                    // const uuids = generate_tag_ids(2);
                    // for (let i = 0; i < uuids.length; i++) {
                    //     tag_mods.push({
                    //         type: TagModificationType.CREATE,
                    //         tag: {
                    //             id: uuids[i],
                    //             name: `Test Tag ${i} HERE`,
                    //             color: "red-800",
                    //             icon: "",
                    //             aliases: ["newest again"],
                    //             parent: "",
                    //             children: []
                    //         }
                    //     });
                    // }
                    // console.log("Tag UUIDs", Object.values(tag_data).map((tag) => tag.id));
                    // console.log("Named ranges", spreadsheet.namedRanges);
                    // const existing_uuids = Object.values(tag_data).map((tag) => tag.id).slice(0, 2);
                    // for (let i = 0; i < existing_uuids.length; i++) {
                    //     tag_mods.push({
                    //         type: TagModificationType.UPDATE,
                    //         tag: {
                    //             id: existing_uuids[i],
                    //             name: `Test Tag ${i} (UPDATED!)`,
                    //             color: "purple-800",
                    //             icon: "",
                    //             aliases: ["updated!"],
                    //             parent: "",
                    //             children: []
                    //         }
                    //     });
                    // }
                    // const alternate_uuids = Object.values(tag_data).map((tag) => tag.id).slice(2, 4)
                    // console.log("Alternate UUIDs", alternate_uuids);
                    // for (let i = 0; i < alternate_uuids.length; i++) {
                    //     tag_mods.push({
                    //         type: TagModificationType.DELETE,
                    //         tag: {
                    //             id: alternate_uuids[i],
                    //             name: `Test Tag ${i} (DELETED!)`,
                    //             color: "purple-800",
                    //             icon: "",
                    //             aliases: [],
                    //             parent: "",
                    //             children: []
                    //         }
                    //     });
                    // }
                    // console.log("Tag modifications", tag_mods);
                    // apply_tag_modifications(spreadsheet, tag_mods).then((result) => {
                    //     console.log("New spreadsheet", result);
                    // });

                    // delete_named_rows(spreadsheet, [Object.keys(tag_data)[0]]).then((result) => {
                    //     console.log("Deleted rows", result);
                    // });
                    // const uuids = generate_tag_ids(2);
                    // const test_tags: TagList = {};
                    // for (let i = 0; i < uuids.length; i++) {
                    //     test_tags[uuids[i]] = {
                    //         id: uuids[i],
                    //         name: `Test Tag ${i}`,
                    //         color: "red-800",
                    //         icon: "",
                    //         aliases: [],
                    //         parent: "",
                    //         children: []
                    //     }
                    // }
                    // create_tag_rows(spreadsheet, test_tags)
                    /*.then((result) => {
                    console.log("Created tags", result);
                    test_tags[uuids[0]] = {
                        id: uuids[0],
                        name: "This Tag (UPDATED!)",
                        color: "purple-800",
                        icon: "",
                        aliases: [],
                        parent: "",
                        children: []
                    }
                    update_existing_tag_rows(sheet_id, test_tags).then((result) => {
                        console.log("Updated tags", result);
                    });
                });*/
                });
            },
        );
    };

    const save_tag_file = async () => {
        console.log("Saving tag file...");
        let progress_step = 0;
        dispatch(initializeProgress({ steps: 3, message: "Saving..." }));
        // Save tag modifications
        const tag_mod_result = apply_tag_modifications(
            tag_spreadsheet,
            tag_mods,
        ).then((result) => {
            console.log("Saved tags", result);
            dispatch(
                updateProgress({ step: progress_step++, message: "Saving..." }),
            );
        });
        // Save file modifications
        const file_mod_result = apply_file_modifications(
            tag_spreadsheet,
            file_mods,
        ).then((result) => {
            console.log("Saved files", result);
            dispatch(
                updateProgress({ step: progress_step++, message: "Saving..." }),
            );
        });
        // Await both tag and file modifications
        return Promise.all([tag_mod_result, file_mod_result]).then(() => {
            dispatch(updateProgress({ step: 3, message: "Saved!" }));
            dispatch(clearTagModQueue());
            dispatch(clearFileModQueue());
            // Clear progress bar after a second
            setTimeout(() => {
                dispatch(clearProgress());
            }, 1000);
        });
    };

    // Save tag file when leaving the page
    window.onbeforeunload = (e) => {
        console.log("Is modified", is_modified);
        if (is_modified) {
            save_tag_file();
            const event = e || window.event;
            if (event) {
                event.returnValue =
                    "You have unsaved changes. Are you sure you want to leave?";
            }
            return "You have unsaved changes. Are you sure you want to leave?";
        }
        return;
    };

    const SHORTCUT_KEYS = ["meta+s", "ctrl+s", "/"];

    const ref = useHotkeys(
        SHORTCUT_KEYS,
        (_, handler) => {
            if (!handler || !handler.keys) return;

            const shortcut = handler.keys.join("");

            if (shortcut == "/") {
                document.getElementById("fileSearchBox")?.focus();
            }
            if (shortcut == "s" && (handler.meta || handler.ctrl)) {
                save_tag_file();
            }
        },
        { preventDefault: true },
    );

    return (
        <>
            <div
                className="align-middle justify-center h-dvh p-8"
                // @ts-expect-error This is a valid ref, its from the useHotkeys hook and is designed to be used this way
                ref={ref}
                tabIndex={-1}
                onClick={() => {
                    // Clear selected files when clicking outside of the file panel
                    // dispatch(clearSelectedFiles());
                }}
            >
                <AnimatePresence>
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: progress_data.steps > 0 ? 1 : 0,
                            transition: { duration: 0.3 },
                        }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.3 },
                        }}
                        className="absolute m-auto pl-16 right-8 bottom-1 z-50 h-fit w-full flex items-center justify-end gap-2 overflow-hidden"
                    >
                        <div className="mb-1 text-default-800 text-sm font-semibold w-fit min-w-fit h-5">
                            {progress_data.message}
                        </div>
                        <Progress
                            aria-label={progress_data.message || "Progress bar"}
                            value={progress_data.current}
                            maxValue={progress_data.steps}
                            size="md"
                            className="max-w-xl w-full"
                            classNames={{
                                indicator:
                                    "bg-gradient-to-r from-secondary-500 to-primary-600",
                                track: "drop-shadow-md border border-2 border-primary-100/30 bg-primary-50/40",
                            }}
                        />
                    </motion.div>

                    {/* {loading_modal.message && <motion.div
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
                    </motion.div>} */}
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
                            // onDragEnter={(e) => {
                            //     // Reset dragged over items when dragged into the control panel
                            //     if (dragging.type == "tag") {
                            //         e.preventDefault();
                            //         dispatch(resetDraggedOver());
                            //     }
                            // }}
                            className="relative flex flex-col overflow-auto gap-2 row-span-2 w-full order-last sm:order-first sm:row-auto sm:col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-1 2xl:grid-cols-1 h-full"
                        >
                            <div
                                id="tag-search-bar"
                                className="w-full h-fit flex-none flex flex-row gap-2 rounded-lg"
                            >
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="ghost"
                                    isDisabled={!are_drive_files_loaded}
                                    className="text-primary-800 w-2/5 bg-primary-200 h-[50px] text-[0.92rem]"
                                    onClick={() => {
                                        if (is_modified) {
                                            save_tag_file().then(() => {
                                                window.location.href = "/";
                                            });
                                        } else {
                                            window.location.href = "/";
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
                            <TagSearchBox />
                            <div className="w-full h-full flex-1 overflow-auto">
                                <TagSidebar />
                            </div>
                        </div>
                        <div
                            id="main-panel"
                            className="flex flex-col gap-2 overflow-auto row-span-3 sm:row-auto sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-3 2xl:col-span-4 w-full h-full"
                        >
                            <div className="w-full h-fit flex-none">
                                <FileSearchBox />
                            </div>
                            <div
                                id="super-file-card-container"
                                onScroll={(e) => {
                                    const scrollTop = e.currentTarget.scrollTop;
                                    const scrollHeight =
                                        e.currentTarget.scrollHeight;
                                    const clientHeight =
                                        e.currentTarget.clientHeight;
                                    const position = Math.ceil(
                                        (scrollTop /
                                            (scrollHeight - clientHeight)) *
                                            100,
                                    );
                                    if (position > 75) {
                                        // Load more files
                                        // TODO: Consider not loading if all files are visible, to stop dispatch loading time
                                        dispatch(incrementVisibleFileCount());
                                    }
                                }}
                                className="relative w-full h-full flex-1 overflow-y-scroll rounded-3xl bg-primary-50"
                            >
                                <FileCardContainer />
                                <SelectedTagsPopup />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

export default EditorNew;
