import "../editor/Editor.css";
import {
    Button,
    // Autocomplete,
    // AutocompleteItem,
    // Button,
    Card,
    Image,
    Input,
    // Listbox,
    // ListboxItem,
    // Popover,
    // PopoverContent,
    // PopoverTrigger,
    // Selection,
    Skeleton,
    Spacer,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@nextui-org/react";
import { GoogleFile } from "../drive/google_types.js";
import { Tag, TagID } from "./tag_types.js";
import { addTagToFileID, getFileTags, getFileTagsByID, getQueriedTags, getTagByID, getTagMetadata, setQueriedTags } from "./tags_slice.js";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import { appendSelectedFile, appendSelectedFilesBetween, clearSelectedFiles, getDraggedOver, getDragging, getFiles, getFilesLoaded, getQueriedFiles, getSelectedFiles, getVisibleFiles, isSelectedFile, removeDraggedOver, removeSelectedFile, resetDraggedOver, resetDragging, setDraggedOver, setDragging, setQueriedFiles, setSelectedFiles, setVisibleFilesSafe, toggleSelectedFile } from "../drive/files_slice.js";
import { useState } from "react";
import { getTypedTags, getValue, setTypedTags, setValue } from "./tag_search_slice.js";

import { AnimatePresence, animate, motion } from "framer-motion";

import Fuse from "fuse.js";
import { getCurrentBreakpoint } from "../editor/get_screen_break.js";
import { file_columns } from "../assets/constants.js";
import { useHotkeys } from "react-hotkeys-hook";

export function FileSearchBox() {
    const dispatch = useAppDispatch();
    const files = useAppSelector(getFiles);
    const file_tags = useAppSelector(getFileTags);
    return (
        <Input
            variant="bordered"
            placeholder="Filter files by name or tag..."
            isClearable
            labelPlacement="inside"
            classNames={{
                base: "h-full",
                mainWrapper: "h-full",
                inputWrapper: "h-[50px] caret-primary-400 group-data-[focus=true]:border-primary-600 border-primary-800/50 data-[hover=true]:border-primary-600/50",
                input: "text-md placeholder:text-primary-800/60"
            }}
            startContent={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="hsl(var(--nextui-primary-900))" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            }
            onValueChange={
                (value) => {
                    if (value === "") {
                        dispatch(setQueriedFiles(files));
                        return;
                    }
                    const fuse = new Fuse(files, {
                        keys: ["data"],
                        ignoreLocation: true,
                        useExtendedSearch: true,
                        // includeScore: true,
                        getFn: (file: GoogleFile, path: string | string[]) => {
                            return file.name + (file_tags[file.id] || {search_string: ""}).search_string;
                        },
                        threshold: 0.5,
                    }).search(value);
                    dispatch(setQueriedFiles(fuse.map((result) => result.item)));
                    document.getElementById("super-file-card-container")?.scrollTo({top: 0, behavior: "instant"});
                }
            }   
        />
    );

}

// export function FileSearchBox(props: {[popover_id: string]: string}) {
//     const dispatch = useAppDispatch();
//     const popover_id = props.popover_id;
//     const [hidden, setHidden] = useState(true);
//     const typed_tags = useAppSelector(getTypedTags);
//     const tags = useAppSelector(getTagMetadata);
//     const value = useAppSelector(getValue);
//     return (
//         <div className={"items-center justify-center"}>
//             <Input
//                 variant="bordered"
//                 label={<div className= "my-1.5">Search</div>}
//                 placeholder={typed_tags.length == 0 ? "Type a tag or file name..." : ""}
//                 isClearable
//                 classNames={{
//                     base: "h-full",
//                     mainWrapper: "h-full",
//                     inputWrapper: "h-[65px]",
//                     input: "mb-0.5 text-md"
//                 }}
//                 labelPlacement="inside"
//                 startContent={<div className="flex gap-2">
//                     {
//                         typed_tags.map((tag_id) => (
//                             <DraggableTagElement tag_id={tag_id} key={tag_id}/>
//                         ))
//                     }
//                 </div>}
//                 onFocus={() => {
//                     console.log("Hidden False")
//                     setHidden(false);
                    
//                 }}
//                 onBlur={() => {
//                     console.log("Hidden true")
//                     setHidden(true);
//                 }}
//                 value={value}
//                 onValueChange={
//                     (value) => {
//                         dispatch(setValue(value))
//                         if (Object.keys(tags).includes(value)) {
//                             dispatch(setTypedTags([...typed_tags, value]));
//                             dispatch(setValue(""));

//                         }
//                     }
//                 }
//                 onKeyDown={(e) => {
//                     if (e.key === "Backspace" && typed_tags.length > 0 && value === "") {
//                         dispatch(setTypedTags(typed_tags.slice(0, typed_tags.length - 1)));
//                     }
//                 }}
//             />
//             {/* <Card id={popover_id} hidden={hidden} className="absolute w-full z-50 bg-transparent shadow-none    " >
//                 <div className="mx-2 my-0.5 z-50 min-w-[300px] w-1/3 bg-default-200 rounded-2xl px-4 py-2 shadow-xl">Test</div>
//             </Card> */}
            
//         </div>
//     );

// }

function TagElement(props: {tag_id: TagID}) {
    const tag_id = props.tag_id;
    const tag = useAppSelector(getTagByID(tag_id));
    const files_loaded = useAppSelector(getFilesLoaded);
    if (!files_loaded) {
        return <div></div>;
    }
    return (
        <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
        }}
        className={`h-[30px] w-fit pt-1.5 p-2 px-3 bg-${tag.color} rounded-full`}>
            <h6 className="text-xs h-fit drop-shadow">{tag.name}</h6>
        </motion.div>
    );
}

export function TagCard(props: {tag_ids: TagID[]}) {
    const tag_ids = props.tag_ids;
    return (
        <Card 
            className="flex-row flex-wrap overflow-auto border-none bg-zinc-700 h-[90px] w-full rounded-md p-2 gap-2">
            {
                tag_ids.map((tag_id) => (
                    <TagElement tag_id={tag_id} key={tag_id}/>
                ))
            }
        </Card>
    );
}


export function DraggableTagElementHandler(props: {tag_id: TagID, depth?: number}) {
    const [open, setOpen] = useState(true);
    const [pressed, setPressed] = useState(false);
    const tag_id = props.tag_id;
    const tag = useAppSelector(getTagByID(tag_id));
    const depth = props.depth || 0;

    return (
        <div className="gap-4 h-full">
        <motion.div
            animate={{
                scale: pressed ? 0.99 : 1
            }}
            className={`flex flex-row gap-2 items-center rounded-md bg-primary-700/20 p-1.5`}
        >
            {
                (tag && tag.children.length > 0)
                ? 
                <motion.svg
                    initial={{
                        rotate: 90
                    }}
                    whileHover={{
                        scale: 1.1,
                    }}
                    whileTap={{
                        scale: 0.9,
                    }}
                    onTapStart = {
                        () => setPressed(true)
                    }
                    animate={{
                        rotate: open ? 90 : 0
                    }}
                    onClick={() => {
                        setOpen(!open);
                        setPressed(false);
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={"size-4 -me-0.5 active:outline-none focus:outline-none"}
                    tabIndex={-1}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </motion.svg>
                :
                <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" className="-me-0.5">
                    <circle r={4.5} cx={8.25} cy={8.25} stroke="white" strokeWidth={1.5} fill="none" className="size-4"></circle>
                </svg>
            }
            <DraggableTagElement tag_id={props.tag_id}/>
        </motion.div>
        <motion.div
            animate={{
                scaleY: open ? 1 : 0,
                opacity: open ? 1 : 0
            }}
            transition={{
                ease: "easeInOut",
                duration: 0.15,
            }}
            className="gap-2"
        >
            {
            tag && tag.children.map((child_id) => (
                <div key={child_id} className={`ps-${5 * (depth + 1)} pt-2`}>
                    <DraggableTagElementHandler tag_id={child_id} key={child_id} depth={depth + 1}/>
                </div>
            ))
        }
        </motion.div>
    </div>
    )
}

export function DraggableTagElement(props: {tag_id: TagID}) {
    const dispatch = useAppDispatch();
    const tag_id = props.tag_id;
    const tag = useAppSelector(getTagByID(tag_id));
    const files = useAppSelector(getFiles);
    const files_loaded = useAppSelector(getFilesLoaded);
    const dragged_over = useAppSelector(getDraggedOver);
    // const selected_files = useAppSelector(getSelectedFiles);
    return (
        <Skeleton
            isLoaded={tag !== undefined}
            className="h-full rounded-full w-fit"
            classNames={{
                base: "bg-primary-700/50 before:via-primary-700/60"
            }}
        >
            {!tag
            ? <div className="h-[30px] rounded-full w-[100px]"></div>
            : <motion.div 
            draggable
            dragMomentum={false}
            dragSnapToOrigin
            whileTap={{
                scale: 0.95,
            }}
            onDragStart={() => {
                console.log("Dragging tag", tag_id)
                dispatch(setDragging({type: "tag", id: tag_id}));
            }}
            onDrag={(e) => {
                e.preventDefault();
            }}
            onDragEnd={() => {
                dragged_over.forEach((file_index: number) => {
                    dispatch(addTagToFileID({tag_id: tag_id, file_id: files[file_index].id}))
                });
                // TODO: Consider clearing selected files after drag?
                // if (dragged_over == selected_files) {
                //     dispatch(clearSelectedFiles());
                // }
                dispatch(resetDraggedOver());
                dispatch(resetDragging());
            }}
            className={`flex h-[30px] w-fit z-25 pt-1.5 pe-3 ps-1 bg-${tag.color} rounded-full cursor-move tag-element`}>
                <div className="w-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>
                </div>
                <div className="w-1 me-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>
                </div>
                
                <h6 className="text-xs h-fit drop-shadow">{tag.name}</h6>
            </motion.div>}
        </Skeleton>
    );
}

export function FileCardContainer() {
    const dispatch = useAppDispatch();
    const queried_files = useAppSelector(getQueriedFiles);
    const visible_files = useAppSelector(getVisibleFiles);
    const selected_files = useAppSelector(getSelectedFiles);
    // const first_selected_file = selected_files.length > 0 ? selected_files[0] : null;
    const last_selected_file = selected_files.length > 0 ? selected_files[selected_files.length - 1] : null;

    const SHORTCUT_KEYS = [
        "down",
        "up",
        "left",
        "right",
        "shift+down",
        "shift+up",
        "shift+left",
        "shift+right",
        "ctrl+shift+down",
        "ctrl+shift+up",
        "ctrl+shift+left",
        "ctrl+shift+right",
        "ctrl+a",
        "enter",
        "escape",
    ]

    const screen_break = getCurrentBreakpoint();
    const column_number: number = file_columns[screen_break];

    const ref = useHotkeys(SHORTCUT_KEYS, (_, handler) => {
        if (!handler || !handler.keys) return;
        const shortcut = handler.keys.join("");
        
        if (shortcut == "a" && handler.ctrl) {
            dispatch(setSelectedFiles([...Array(queried_files.length).keys()]));
        }
        if (shortcut == "enter") {
            dispatch(toggleSelectedFile(last_selected_file));
        }
        if (shortcut == "escape") {
            console.log("Clearing selected files")
            dispatch(clearSelectedFiles());
        }
        if (shortcut == "down") {
            if (last_selected_file !== null) {
                if (last_selected_file + column_number < queried_files.length) {
                    if (handler.ctrl && handler.shift) {
                        dispatch(appendSelectedFilesBetween([last_selected_file, last_selected_file + column_number]));
                    } else if (handler.shift) {
                        dispatch(appendSelectedFile(last_selected_file + column_number));
                    } else {
                        dispatch(clearSelectedFiles());
                        dispatch(appendSelectedFile(last_selected_file + column_number));
                    }

                    document.getElementById(`file-card-${last_selected_file + column_number}`)?.scrollIntoView(
                        {behavior: "smooth", block: "nearest", inline: "nearest"}
                    );
                }
            }
        }
        if (shortcut == "up") {
            if (last_selected_file !== null) {
                if (last_selected_file - column_number >= 0) {
                    if (handler.ctrl && handler.shift) {
                        dispatch(appendSelectedFilesBetween([last_selected_file, last_selected_file - column_number]));
                    } else if (handler.shift) {
                        dispatch(appendSelectedFile(last_selected_file - column_number));
                    } else {
                        dispatch(clearSelectedFiles());
                        dispatch(appendSelectedFile(last_selected_file - column_number));
                    }
                    document.getElementById(`file-card-${last_selected_file - column_number}`)?.scrollIntoView(
                        {behavior: "smooth", block: "nearest", inline: "nearest"}
                    );
                }
            }
        }
        if (shortcut == "right") {
            if (last_selected_file !== null) {
                if (last_selected_file%column_number + 1 < column_number) {
                    if (handler.ctrl && handler.shift) {
                        dispatch(appendSelectedFilesBetween([last_selected_file, last_selected_file + 1]));
                    } else if (handler.shift) {
                        dispatch(appendSelectedFile(last_selected_file + 1));
                    } else {
                        dispatch(clearSelectedFiles());
                        dispatch(appendSelectedFile(last_selected_file + 1));
                    }
                }
            }
        }
        if (shortcut == "left") {
            if (last_selected_file !== null) {
                if (last_selected_file%column_number - 1 >= 0) {
                    if (handler.ctrl && handler.shift) {
                        dispatch(appendSelectedFilesBetween([last_selected_file, last_selected_file - 1]));
                    } else if (handler.shift) {
                        dispatch(appendSelectedFile(last_selected_file - 1));
                    } else {
                        dispatch(clearSelectedFiles());
                        dispatch(appendSelectedFile(last_selected_file - 1));
                    }
                }
            }
        }
    }, { preventDefault: true });

    return (
        <div
            id="file-card-container"
            // @ts-expect-error - This is a valid ref, its from the useHotkeys hook and is designed to be used this way
            ref={ref}
            className="grid p-2 gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
                {
                    queried_files.slice(0, visible_files).map((file, index) => {
                        return <FileCard file={file} index={index} key={index}/>
                    })
                }
        </div>
    )
}


export function FileCard(props: {file: GoogleFile | null, index: number}) {
    const dispatch = useAppDispatch();
    const file = props.file;
    const index = props.index;
    const file_name = file?.name;
    // TODO: Show in top right corner?
    // const file_type = file?.mimeType;
    const dragged_over_file_indices = useAppSelector(getDraggedOver);
    const dragging_metadata = useAppSelector(getDragging);
    const selected_files = useAppSelector(getSelectedFiles);
    const is_selected = useAppSelector(isSelectedFile(index));

    const last_selected_file = selected_files.length > 0 ? selected_files[selected_files.length - 1] : null;
    // TODO: use thumbnailLink instead of iconLink, google drive just
    // hates me sometimes and doesn't want to display thumbnails
    const thumbnail_link = file?.thumbnailLink
    const icon_link = file?.iconLink;
    const file_tag_ids = useAppSelector(getFileTagsByID(file?.id || "")) || {tags: []};

    if (is_selected) {
        console.log(file?.parents)
    }

    return (
      <motion.button
        whileTap={{
                scale: 0.97
        }}
        id={`file-card-${index}`}
        onDoubleClick={(e)=>{
            if (file === null) return;
            e.preventDefault();
            e.stopPropagation();
            window.open(file.webViewLink, '_blank')!.focus()
        }}
        onClick={(e)=>{
            if (file === null) return;
            if (e.ctrlKey) {
                dispatch(toggleSelectedFile(index));
            } else if (e.shiftKey && last_selected_file !== null) {
                // Add all files between the first selected file and this file
                dispatch(appendSelectedFilesBetween([last_selected_file, index]));
            } else {
                dispatch(clearSelectedFiles());
                dispatch(appendSelectedFile(index));
            }
            e.preventDefault();
            e.stopPropagation();
        }}
        onDragEnter={(e) => {
            console.log("Drag enter", index)
            e.preventDefault();
            if (dragging_metadata.type == "tag") {
                if (selected_files.length > 0 && selected_files.includes(index)) {
                    // Add tag to all selected files
                    dispatch(setDraggedOver(selected_files));
                } else {
                    dispatch(setDraggedOver([index]));
                }
            }
        }}
        onDragOver={(e) => {
            e.preventDefault();
        }}
        className={"bg-zinc-900 rounded-2xl scroll-m-2 " +
            "text-foreground outline-none shadow-medium hover:bg-content2 " +
            (dragged_over_file_indices.includes(index) ? "ring-2 ring-secondary-500 " : 
            last_selected_file === index ? "ring-2 ring-primary-500 " : 
            is_selected ? "ring-2 ring-primary-300 " : ""
            )
        }
        type="button"
        role="button">
    
            <div className="relative w-full h-full items-center justify-center p-2">
                {file !== null ?
                    <div
                    className="size-6 absolute z-10 right-3 top-3">
                        <Image
                            draggable={false}
                            width={25}
                            src={icon_link}
                            className="object-cover w-full rounded-md shadow-lg"
                        ></Image>
                    </div> : <div></div>
                    }
                <Skeleton
                    isLoaded={file !== null}
                    className="rounded-t-lg"
                >
                    <div className="overflow-hidden w-full h-[200px] place-content-center bg-zinc-700 rounded-t-md">
                        <Image
                            draggable={false}
                            alt={file_name}
                            src={thumbnail_link}
                            loading="eager"
                            disableSkeleton
                            // crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className="rounded-t-md object-cover static h-[200px] w-full"
                        />
                    </div>
                </Skeleton>
                <Skeleton
                    isLoaded={file !== null}
                    className="rounded-b-lg"
                >
                    <Tooltip content={file_name} delay={250} className="w-[150px] bg-zinc-900/85 shadow-md">
                        <h3 className="truncate w-full h-[30px] bg-zinc-700 rounded-b-md py-1 px-3 font-medium">{file_name}</h3>
                    </Tooltip>
                </Skeleton>
                <Spacer y={3}/>
                <Skeleton
                    isLoaded={file !== null}
                    className="rounded-lg"
                >   
                    <TagCard tag_ids={file_tag_ids.tags}/>
                </Skeleton>
            </div>
      </motion.button>  
    );
}


export function TagPanel() {
    const queried_tags = Object.values(useAppSelector(getQueriedTags));
    const dragging_metadata = useAppSelector(getDragging);
    console.log("Drag metadata", dragging_metadata)
    return (
        <div
            className="relative w-full h-full rounded-2xl"
        >
            <AnimatePresence>
            {
                (
                    <motion.div
                    animate={{  opacity: dragging_metadata.type === "tag" ? 1 : 0 }}
                    transition={{
                        type: "easeInOut",
                        duration: 0.2
                    }}
                    key="tag-drag-indicators"
                    className="absolute m-auto left-0 right-0 top-0 bottom-0 w-[200px] h-[60px] rounded-lg text-base text-primary-900/50"
                    >Drop tag here to cancel</motion.div>
                )
            }
            <motion.div
                id="tag-panel"
                key="tag-panel"
                dir="rtl"
                className={"w-full h-full flex-1 overflow-auto rounded-2xl bg-primary-700/15"}
                style={{
                    // filter: dragging_metadata.type === "tag" ? "blur(5px)" : "",
                    transition: "filter 0.2s ease-in-out"
                }}
                transition={{
                    duration: 0.2,
                    ease: "easeInOut"
                }}
            >
                <div
                id="tag-panel-inner"
                dir="ltr"
                className="grid gap-2 p-3 grid-cols-1">
                    
                    <NewTagElement/>
                    {
                        queried_tags.filter((tag) => tag === null || tag.parent === "").map((tag, index) => {
                            return (
                                <DraggableTagElementHandler
                                key={index}
                                tag_id={tag !== null ? tag.name : ""}
                                />
                            );
                        })
                    }
                </div>
            </motion.div>
            </AnimatePresence>
        </div>
    )
}


export function TagSearchBox() {
    const dispatch = useAppDispatch();
    const tags = Object.values(useAppSelector(getTagMetadata));
    return (
        <Input
            variant="bordered"
            placeholder="Filter tags..."
            isClearable
            labelPlacement="inside"
            classNames={{
                base: "h-full",
                mainWrapper: "h-full",
                inputWrapper: "h-[50px] caret-secondary-400 group-data-[focus=true]:border-secondary-600 border-secondary-800/50 data-[hover=true]:border-secondary-600/50",
                input: "text-md placeholder:text-primary-800/60"
            }}
            startContent={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="hsl(var(--nextui-primary-900))" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
            }
            onValueChange={
                (value) => {
                    if (value === "") {
                        dispatch(setQueriedTags(tags));
                        return;
                    }
                    const fuse = new Fuse(tags, {
                        keys: ["name", "aliases"],
                        ignoreLocation: true,
                        useExtendedSearch: true,
                        // includeScore: true,
                        threshold: 0.5,
                    }).search(value);
                    dispatch(setQueriedTags(fuse.map((result) => result.item)));
                    document.getElementById("tag-panel")?.scrollTo({top: 0, behavior: "instant"});
                }
            }   
        />
    );

}


export function NewTagElement() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (
        <div className="gap-4 mb-1.5">
            <Button
                
                fullWidth
                className={`flex flex-row gap-2 rounded-md bg-primary-700/50 p-1.5`}
                onClick={onOpen}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={"size-4 -me-0.5 active:outline-none focus:outline-none"}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <div className="h-[30px] text-base py-1 text-primary-900">New Tag</div>
            </Button>
            <TagModal isOpen={isOpen} onOpenChange={onOpenChange}/>
        </div>
    );
}

export function TagModal(props: {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    name?: string, 
    color?: string,
    aliases?: string[],
    children?: TagID[],
    parent?: TagID,
}) {
    const isOpen = props.isOpen;
    const onOpenChange = props.onOpenChange;
    return (
    <Modal
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur"
        motionProps={{
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: 1, scale: 1,},
            exit: { opacity: 0, scale: 0.5 },
            transition: { duration: 0.1, ease: "easeInOut", type: "spring", stiffness: 260, damping: 20}
        }}
    >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1"> {props.name ? "Modify Tag" : "Create New Tag"}</ModalHeader>
              <ModalBody>
                <div>Test body</div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="secondary" onPress={onClose}>
                  {props.name ? "Save" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>

    </Modal>
    )
}


// export function AddTagsCard() {

//     
//     const tags = useAppSelector(getTagMetadata);
//     return (
//         <Autocomplete
//         variant="bordered"
//         label="Add a tag" >
//             {
//                 Object.entries(tags).map(([tag_id, tag]) => (
//                     <AutocompleteItem key={tag_id} value={tag.name}>
//                         {tag.name}
//                     </AutocompleteItem>
//                 ))
//             }
//         </Autocomplete>
//         // <Card
//         //     className="flex-row flex-wrap overflow-auto border-none bg-zinc-700 h-[90px] w-full rounded-md p-2 gap-2">
            
//         // </Card>
//     );
// }

// export function FileCard(props: {file: GoogleFile | null}) {
//     const file = props.file;
//     const file_name = file?.name;
//     const file_type = file?.mimeType;
//     const thumbnail_link = file?.thumbnailLink;
//     console.log(file)
//     return (
//         <Card
//             isBlurred={false}
//             className="border-none bg-zinc-900 rounded-2xl">
//             <div className="h-full items-center justify-center p-2 space-y-3">
//                 <Skeleton
//                     isLoaded={file !== null}
//                     className="rounded-lg"
//                 >
//                     <div className="overflow-hidden w-full h-[200px] place-content-center bg-zinc-800 rounded-md">
//                         <Image
//                             alt={file_name}
//                             src={thumbnail_link}
//                             className="rounded-md object-cover h-[200px]"
//                         />
//                     </div>
//                 </Skeleton>
//                 <Skeleton
//                     isLoaded={file !== null}
//                     className="rounded-lg"
//                 >
//                     <h3 className="w-full h-[30px] bg-zinc-800 rounded-md py-1 px-3">{file_name}</h3>
//                 </Skeleton>
//                 <Skeleton
//                     isLoaded={file !== null}
//                     className="rounded-lg"
//                 >
//                     <h3 className="w-full h-[60px] bg-zinc-800 rounded-md p-1">{file_type}</h3>
//                 </Skeleton>
//             </div>
//         </Card>
//     );
// }


// export function TagSearchBox(props: { tags: Tag[], selectedKeys: string[], setSelectedKeys: (keys: Selection) => void}) {
//     return (
//         <div className={"items-center justify-center"}>
//             <Autocomplete
//                 variant="bordered"
//                 aria-label="Search"
//                 placeholder="Enter your search here..."
//                 allowsCustomValue
//                 shouldCloseOnBlur={false}
//                 menuTrigger="focus"
//                 className="w-full"
//                 onSelectionChange={
//                     (selection) => {
//                         console.log(selection);
//                     }
//                 }
//             >
//                 {
//                     props.tags.map((tag) => (
//                         <AutocompleteItem key={tag.id} value={tag.id} className="p-2">
//                             {tag.name}
//                         </AutocompleteItem>
//                     ))
//                 }
//             </Autocomplete>
//         </div>
//     );

// }


// export function TagSearchBox(props: { tags: Tag[], selectedKeys: string[], setSelectedKeys: (keys: Selection) => void}) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [isFocused, setIsFocused] = useState(false);
//     let ext_focus: CallableFunction | null = null;
//     return (
//         <div className={"items-center justify-center"}>
//             <Input
//                 variant="bordered"
//                 label="Search"
//                 placeholder="Enter your search here..."
//                 className="w-full"
//                 onClick={() => {
//                     console.log("Click");
//                     ext_focus = focus;
//                     setIsOpen(true);
//                     focus();}}
//                 onFocus={() => {
//                     console.log("Focus");
//                 }}
//                 // onBlur={() => {
//                 //     setIsOpen(false);
//                 // }}
//             />
//             <Popover
//                 placement="bottom-start"
//                 className="p-2 -mx-5"
//                 isOpen={isOpen}
//                 onClick={() => {ext_focus!()}}
//                 >
//                 <PopoverTrigger>
//                     <h1 onClick={() => {ext_focus!()}}>Test</h1>
//                 </PopoverTrigger>
//                 <PopoverContent>
//                     <div className="px-1 py-2">
//                         <div className="text-small font-bold">Popover Content</div>
//                         <div className="text-tiny">This is the popover content</div>
//                     </div>
//                     <Button>Test</Button>
//                 </PopoverContent>
//             </Popover>
//             <Listbox 
//                 aria-label="Multiple selection example"
//                 variant="flat"
//                 selectionMode="multiple"
//                 selectedKeys={props.selectedKeys}
//                 onSelectionChange={props.setSelectedKeys}
//                 className="w-[300px]"
//                 >
//                     {
//                         props.tags.map((tag) => (
//                             <ListboxItem key={tag.id} value={tag.id} className="p-2">
//                                 {tag.name}
//                             </ListboxItem>
//                         ))
//                     }
//             </Listbox>
//         </div>
//     );

// }