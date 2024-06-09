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
    useDisclosure,
    Select,
    SelectItem
} from "@nextui-org/react";
import { GoogleFile } from "../drive/google_types.js";
import { Tag, TagID } from "./tag_types.js";
import { addTagToFileID, getFileTags, getFileTagsByID, getModifyingTagData, getQueriedTags, getTagByID, getTagMetadata, modifyTagMetadata, removeTagFromFileID, resetQueriedTags, setModifyingTagData, setQueriedTags } from "./tags_slice.js";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import { appendSelectedFile, appendSelectedFilesBetween, clearSelectedFiles, getDraggedOver, getDragging, getFiles, getFilesLoaded, getQueriedFiles, getSelectedFiles, getVisibleFiles, isSelectedFile, removeDraggedOver, removeSelectedFile, resetDraggedOver, resetDragging, setDraggedOver, setDragging, setQueriedFiles, setSelectedFiles, setVisibleFilesSafe, toggleSelectedFile } from "../drive/files_slice.js";
import { useState } from "react";
import { getTypedTags, getValue, setTypedTags, setValue } from "./tag_search_slice.js";

import { AnimatePresence, animate, motion } from "framer-motion";

import Fuse from "fuse.js";
import { getCurrentBreakpoint } from "../editor/get_screen_break.js";
import { file_columns } from "../assets/constants.js";
import { useHotkeys } from "react-hotkeys-hook";

import { TAG_COLORS } from "../assets/constants.js";

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

function PlainTagElement(props: {tag_id: TagID}) {
    const tag_id = props.tag_id;
    const tag = useAppSelector(getTagByID(tag_id));
    const files_loaded = useAppSelector(getFilesLoaded);
    if (!files_loaded) {
        return <div></div>;
    }
    return (
        // <motion.div 
        // initial={{ scale: 0 }}
        // animate={{ scale: 1 }}
        // transition={{
        //     type: "spring",
        //     stiffness: 260,
        //     damping: 20
        // }}
        // className={`h-[30px] w-fit pt-1.5 p-2 px-3 bg-${tag.color} rounded-full`}>
        //     <h6 className="text-xs h-fit drop-shadow">{tag.name}</h6>
        // </motion.div>
        <div
        className={`h-[30px] w-fit pt-1.5 p-2 px-3 bg-${tag.color} rounded-full`}>
            <h6 className="text-xs h-fit drop-shadow text-default-700">{tag.name}</h6>
        </div>
    );
}

export function TagCard(props: {tag_ids: TagID[], file_index: number | undefined}) {
    const tag_ids = [...props.tag_ids];
    return (
        <AnimatePresence>
            <Card 
                className="flex-row flex-wrap overflow-auto border-none bg-primary-600/15 h-[90px] w-full rounded-md p-2 gap-2"
            >
                {
                    tag_ids.sort().map((tag_id) => (
                        <DraggableTagElement tag_id={tag_id} dragging_type="file" file_index={props.file_index} key={tag_id}/>
                    ))
                }
            </Card>
        </AnimatePresence>
    );
}


export function DraggableTagElementHandler(props: {tag_id: TagID, modify_modal_onOpen: () => void}) {
    const [open, setOpen] = useState(true);
    const [animationOver, setAnimationOver] = useState(false);
    const [pressed, setPressed] = useState(false);
    const tag_id = props.tag_id;
    const tag = useAppSelector(getTagByID(tag_id));

    return (
        <div className="gap-4 h-full">
        <motion.div
            animate={{
                scale: pressed ? 0.99 : 1
            }}
            
            className={`flex flex-row gap-2 items-center rounded-md bg-secondary-700/20 p-1.5`}
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
                        setAnimationOver(false);
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
            <div
            >
                <DraggableTagElement
                    tag_id={props.tag_id}
                    modify_modal_onOpen={props.modify_modal_onOpen}
                />
            </div>
        </motion.div>
        <motion.div
            animate={{
                // scaleY: open ? 1 : 0,
                height: open ? "auto" : 0,
                opacity: open ? 1 : 0,
            }}
            transition={{
                ease: "easeInOut",
                duration: 0.12,
            }}
            onAnimationComplete={() => setAnimationOver(!open)}
            className="gap-2"
        >
            {
            !animationOver && tag && tag.children.map((child_id) => (
                <div key={child_id} className="ps-5 pt-2">
                    <DraggableTagElementHandler
                        tag_id={child_id}
                        key={child_id}
                        modify_modal_onOpen={props.modify_modal_onOpen}
                    />
                </div>
            ))
        }
        </motion.div>
    </div>
    )
}

export function DraggableTagElement(props: {tag_id: TagID, dragging_type?: "tag" | "file", file_index?: number, modify_modal_onOpen?: () => void}) {
    const dragging_type = props.dragging_type || "tag";
    const dispatch = useAppDispatch();
    const tag_id = props.tag_id;
    const parent_file_id = props.file_index;
    const tag = useAppSelector(getTagByID(tag_id));
    const files = useAppSelector(getFiles);
    const dragged_over = useAppSelector(getDraggedOver);
    const selected_files = useAppSelector(getSelectedFiles);
    // const selected_files = useAppSelector(getSelectedFiles);
    return (
        <Skeleton
            isLoaded={tag !== undefined}
            className="h-fit rounded-full w-fit"
            classNames={{
                base: "bg-secondary-700/50 before:via-secondary-700/60"
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
            {
            ...(dragging_type == "file" ? {initial: { scale: 0 },
                animate: { scale: 1},
                transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    
                    duration: 0.1,
                },
                exit: { scale: 0 },
            } : {})
            }
            onDragStart={() => {
                dispatch(setDragging({type: dragging_type, id: tag_id}));
            }}
            onDrag={(e) => {
                e.preventDefault();
            }}
            onDragEnd={() => {
                if (dragging_type == "tag") {
                    dragged_over.forEach((file_index: number) => {
                        dispatch(addTagToFileID({tag_id: tag_id, file_id: files[file_index].id}))
                    });
                    // TODO: Consider clearing selected files after drag?
                    // if (dragged_over == selected_files) {
                    //     dispatch(clearSelectedFiles());
                    // }
                    dispatch(resetDraggedOver());
                } else if (dragging_type == "file" && parent_file_id !== undefined) {
                    const file = files[parent_file_id];
                    // If the file is selected, remove the tag from all selected files
                    if (selected_files.includes(parent_file_id)) {
                        console.log("Removing tag", tag_id, "from all selected files")
                        selected_files.forEach((file_index) => {
                            dispatch(removeTagFromFileID({tag_id: tag_id, file_id: files[file_index].id}));
                        });
                    } else {
                        // Delete tag from parent file only
                        console.log("Removing tag", tag_id, "from file", parent_file_id)
                        dispatch(removeTagFromFileID({tag_id: tag_id, file_id: file.id}));
                    }
                    
                }
                dispatch(resetDragging());
            }}
            onDoubleClick={() => {
                if (props.modify_modal_onOpen) {
                    dispatch(setModifyingTagData({...tag, is_new: false, blurred_name: false, blurred_color: false,}));
                    props.modify_modal_onOpen();
                }
            }}
            className={`flex h-[30px] w-fit z-25 px-3 py-1.5 bg-${tag.color} rounded-full cursor-move tag-element`}>
                {/* <div className="w-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>
                </div>
                <div className="w-1 me-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>
                </div> */}
                
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
      <motion.div
        whileTap={{
            scale: dragging_metadata.type != "file" ? 0.97 : 1,
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
            e.preventDefault();
            e.stopPropagation();
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
            if (dragging_metadata.type == "tag") {
                e.preventDefault();
            }
        }}
        className={"bg-primary-100/90 rounded-2xl scroll-m-2" +
            " text-foreground outline-none shadow-medium transition-colors hover:bg-primary-300/45" +
            (dragged_over_file_indices.includes(index) ? " ring-2 ring-secondary-500 bg-secondary-100/90" : 
            last_selected_file === index ? " ring-2 ring-primary-500" : 
            is_selected ? " ring-2 ring-primary-300" : ""
            )
        }>
    
            <div className="relative w-full h-full items-center justify-center p-2 select-none">
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
                    className="rounded-t-lg bg-primary-700/25 before:via-primary-700/30"
                >
                    <div className="overflow-hidden w-full h-[200px] place-content-center bg-primary-600/15 rounded-t-md">
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
                    className="rounded-b-lg h-fit bg-primary-700/25 before:via-primary-700/30"
                >
                    {file !== null ? <Tooltip content={file_name} delay={250} className="w-[150px] bg-zinc-900/85 shadow-md">
                        <h3 className="truncate w-full h-[30px] bg-primary-600/15 rounded-b-md py-1 px-3 font-medium">{file_name}</h3>
                    </Tooltip> : <div className="w-full h-[30px]"></div>}
                </Skeleton>
                <Spacer y={3}/>
                <Skeleton
                    isLoaded={file !== null}
                    className="rounded-lg bg-primary-700/25 before:via-primary-700/30"
                >   
                    <TagCard tag_ids={file_tag_ids.tags} file_index={index}/>
                </Skeleton>
            </div>
      </motion.div>  
    );
}


export function TagPanel() {
    // Tag create/modify modal open state
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const queried_tags = Object.values(useAppSelector(getQueriedTags));
    const dragging_metadata = useAppSelector(getDragging);
    const [ blurText, setBlurText ] = useState("");

    return (
        <div
            className="relative w-full flex flex-col h-full rounded-2xl"
        >
            <AnimatePresence>
                <motion.div
                    animate={{  opacity: dragging_metadata.type !== "" ? 1 : 0 }}
                    transition={{
                        type: "easeInOut",
                        duration: 0.2
                    }}
                    key="tag-drag-indicators"
                    onAnimationStart={() => {
                        if (dragging_metadata.type === "tag" && blurText === "") {
                            setBlurText("Drop tag here to cancel");
                        } else if (dragging_metadata.type === "file" && blurText === "") {
                            setBlurText("Drop tag here to remove");
                        }
                    }}
                    onAnimationComplete={() => {
                        if (dragging_metadata.type === "" && blurText !== "") {
                            setBlurText("");
                        }
                    }}
                    className="absolute m-auto cursor-auto left-0 right-0 top-0 bottom-0 w-[200px] h-[60px] rounded-lg text-base text-secondary-600/50"
                >
                    {blurText}
                </motion.div>
                <NewTagElement modify_modal_onOpen={onOpen}/>
                <motion.div
                    id="tag-panel"
                    key="tag-panel"
                    dir="rtl"
                    onDragOver={(e) => {
                        if (dragging_metadata.type === "file") {
                            // Delete tag from file
                            e.preventDefault();
                        }
                    }}
                    className={"w-full h-full overflow-auto flex-1 rounded-2xl bg-secondary-600/15"}
                    style={{
                        filter: dragging_metadata.type !== "" ? "blur(5px)" : "",
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
                        
                        {
                            queried_tags.filter((tag) => tag === null || tag.parent === "").map((tag, index) => {
                                return (
                                    <DraggableTagElementHandler
                                    key={index}
                                    tag_id={tag !== null ? tag.name : ""}
                                    modify_modal_onOpen={onOpen}
                                    />
                                );
                            })
                        }
                    </div>
                </motion.div>
            </AnimatePresence>
            <TagModal isOpen={isOpen} onOpenChange={onOpenChange}/>
        </div>
    )
}


export function TagSearchBox() {
    const dispatch = useAppDispatch();
    const tags: {[id: string]: Tag} = useAppSelector(getTagMetadata);
    const tag_values = Object.values(tags);
    return (
        
            <div
                className="h-fit"
            >
                <Input
                variant="bordered"
                placeholder="Filter tags..."
                isClearable
                labelPlacement="inside"
                classNames={{
                    base: "h-fit",
                    mainWrapper: "h-fit",
                    inputWrapper: "h-[50px] caret-secondary-400 group-data-[focus=true]:border-secondary-600 border-secondary-800/50 data-[hover=true]:border-secondary-600/50",
                    input: "text-md placeholder:text-secondary-700/55"
                }}
                startContent={
                    // <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="hsl(var(--nextui-primary-900))" className="size-4">
                    //     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    // </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="hsl(var(--nextui-primary-900))" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                    </svg>

                }
                onValueChange={
                    (value) => {
                        if (value === "") {
                            dispatch(setQueriedTags(tag_values));
                            return;
                        }
                        const fuse = new Fuse<Tag>(tag_values, {
                            keys: ["name", "aliases"],
                            ignoreLocation: true,
                            useExtendedSearch: true,
                            // includeScore: true,
                            threshold: 0.5,
                        }).search(value);
                        const direct_queried_tags: Tag[] = fuse.map((result) => result.item);
                        console.log(direct_queried_tags);
                        const all_queried_tags = [...new Set(direct_queried_tags.concat(
                            direct_queried_tags.flatMap((tag) => getAllParentTags(tag, tags))
                        ))];
                        dispatch(setQueriedTags(all_queried_tags));
                        document.getElementById("tag-panel")?.scrollTo({top: 0, behavior: "instant"});
                    }
                }   
            />
            </div>
        // </Skeleton>
    );

}

function getAllParentTags(tag: Tag, tags: {[key: string]: Tag}): Tag[] {
    const parent_tags: Tag[] = [];
    let current_tag = tag;
    while (current_tag.parent !== "") {
        const parent_tag = tags[current_tag.parent];
        if (parent_tag !== undefined) {
            parent_tags.push(parent_tag);
            current_tag = parent_tag;
        } else {
            break;
        }
    }
    return parent_tags;
}


export function NewTagElement(props: {modify_modal_onOpen: () => void}) {
    const dispatch = useAppDispatch();
    const files_loaded = useAppSelector(getFilesLoaded);
    return (
        <Skeleton
            isLoaded={files_loaded}
            className="rounded-lg mb-1.5"
            classNames={{
                base: "bg-secondary-700/50 before:via-secondary-700/60"
            }}
        >
            <div className="gap-4">
            <Button
                fullWidth
                className={`flex flex-row gap-2 rounded-md bg-secondary-600/60 p-1.5`}
                isDisabled={!files_loaded}
                onClick={() => {
                    dispatch(setModifyingTagData({name: "", color: "", aliases: [], children: [], parent: "", is_new: true, blurred_name: false, blurred_color: false}));
                    props.modify_modal_onOpen();
                }}
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
        </div>
        </Skeleton>
    );
}

export function TagModal(props: {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const dispatch = useAppDispatch();
    const isOpen = props.isOpen;
    const onOpenChange = props.onOpenChange;
    const tags = useAppSelector(getTagMetadata);

    const modify_data = useAppSelector(getModifyingTagData);

    const validateTagName = (name: string) => {
        if (name === "") {
            return "Tag name cannot be empty";
        } else if (modify_data.is_new && Object.keys(tags).includes(name)) {
            return "Tag name already exists";
        }
        return "";
    }

    const tagNameValid = modify_data.blurred_name && validateTagName(modify_data.name) !== "";

    return (
    <Modal
        isOpen={isOpen} 
        onOpenChange={(open) => {
            return onOpenChange(open);
        }}
        backdrop="blur"
        motionProps={{
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: 1, scale: 1,},
            exit: { opacity: 0, scale: 0.5 },
            transition: { duration: 0.1, ease: "easeInOut", type: "spring", stiffness: 260, damping: 20}
        }}
        classNames={{
            body: "",
        }}
    >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={`flex flex-col gap-2`}> {modify_data.is_new ? "Create New Tag" : "Modify Tag"}</ModalHeader>
              <ModalBody>
                <Input
                    id="tag-name-input"
                    isRequired
                    isDisabled={!modify_data.is_new}
                    variant="faded"
                    label="Tag Name"
                    placeholder="Enter a unique tag name..."
                    defaultValue={modify_data.name}
                    validate={validateTagName}
                    isInvalid={tagNameValid}
                    errorMessage={modify_data.blurred_name ? validateTagName(modify_data.name) : ""}
                    onValueChange={(value) => {
                        dispatch(setModifyingTagData({...modify_data, name: value}))
                    }}
                    onBlur={() => {
                        dispatch(setModifyingTagData({...modify_data, blurred_name: true}));
                    }}
                    classNames={{
                        input: `${tagNameValid ? "placeholder:text-danger" : ""}`
                    }}

                ></Input>
                <Select
                    id="tag-color-select"
                    isRequired
                    variant="faded"
                    label="Tag Color"
                    placeholder="Select a color..."
                    selectedKeys={modify_data.color ? [modify_data.color] : []}
                    onChange={e => {
                        dispatch(setModifyingTagData({...modify_data, color: e.target.value}));
                    }}
                    onBlur={() => {
                        dispatch(setModifyingTagData({...modify_data, blurred_color: true}));
                    }}
                    isInvalid={modify_data.blurred_color && modify_data.color === ""}
                    errorMessage={modify_data.blurred_color && modify_data.color === "" ? "Please select a color" : ""}
                    renderValue={(colors) => {
                        return colors.map((color_data) => {
                            // @ts-expect-error - This is a valid check, the color data is always the name of the color tag
                            const color: string = color_data.key;
                            const upper_color_name = color_data.textValue;
                            return (
                                <div key={color_data.key} className="flex gap-1.5 items-center">
                                    <div className={`w-4 h-4 rounded-full bg-${color}`}></div>
                                    <div className="text-sm text-default-600">{upper_color_name}</div>
                                </div>
                        )});
                    }}
                >
                    {TAG_COLORS.map((color) => {
                        const color_name = color.split("-")[0];
                        const upper_color_name = color_name.charAt(0).toUpperCase() + color_name.slice(1);
                        return (
                            <SelectItem key={color} textValue={upper_color_name}>
                                <div className="flex gap-2 items-center">
                                    <div className={`w-5 h-5 rounded-full bg-${color}`}></div>
                                    <div className="text-base">{upper_color_name}</div>
                                </div>
                            </SelectItem>
                    )})}
                </Select>
                <Input
                    id="tag-aliases-input"
                    variant="faded"
                    label="Tag Aliases"
                    placeholder="Enter alternate tag aliases separated by spaces..."
                    defaultValue={modify_data.aliases.join(" ")}
                    onValueChange={(value) => {
                        dispatch(setModifyingTagData({...modify_data, aliases: value.split(" ")}));
                    }}
                ></Input>
                <Select
                    id="tag-parent-select"
                    variant="faded"
                    label="Tag Parent"
                    placeholder="Assign another tag as a parent..."
                    selectedKeys={modify_data.parent ? [modify_data.parent] : []}
                    onChange={e => {
                        // If the parent is a child of the tag, remove it as a children
                        if (modify_data.children.includes(e.target.value)) {
                            console.log("Removing parent as child")
                            dispatch(setModifyingTagData({...modify_data, parent: e.target.value, children: modify_data.children.filter((child) => child !== e.target.value)}));
                        } else {
                            dispatch(setModifyingTagData({...modify_data, parent: e.target.value}));
                        }
                        
                    }}
                    size="lg"
                    classNames={{
                        label: "text-sm -mt-4"
                    }}
                    renderValue={(selected_tags) => {
                        return selected_tags.map((tag_data) => {
                            // @ts-expect-error - This is a valid check, the color data is always the name of the color tag
                            const tag_id: string = tag_data.key;
                            return (
                                <PlainTagElement key={tag_id} tag_id={tag_id}/>
                        )});
                    }}
                >
                    {
                    // Filter out the current tag from the list of available parents
                    Object.keys(tags).filter((tag_id) => tag_id != modify_data.name).map((tag_id) => {
                        return (
                            <SelectItem key={tag_id} textValue={tag_id}>
                                <PlainTagElement tag_id={tag_id}/>
                            </SelectItem>
                    )})
                    }
                </Select>
                <AnimatePresence>
                <Select
                    id="tag-child-select"
                    selectedKeys={modify_data.children}
                    variant="faded"
                    label="Tag Children"
                    placeholder="Assign tags as children..."
                    selectionMode="multiple"
                    onChange={e => {
                        dispatch(setModifyingTagData({...modify_data, children: e.target.value.split(",")}));
                    }}
                    size="lg"
                    classNames={{
                        label: "text-sm -mt-4"
                    }}
                    renderValue={(selected_tags) => {
                        return (
                            
                                selected_tags.length > 0
                                ? <div className="flex gap-2">
                                    {selected_tags.map((tag_data) => {
                                        // @ts-expect-error - This is a valid check, the color data is always the name of the color tag
                                        const tag_id: string = tag_data.key;
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 260,
                                                    damping: 20
                                                }}
                                                key={tag_id}
                                            >
                                                <PlainTagElement key={tag_id} tag_id={tag_id}/>
                                            </motion.div>
                                    )})}
                                </div>
                                : <div
                                
                                >Assign tags as children...</div>
                        );
                    }}
                >
                    {
                        // Filter out the current tag and the parent from the list of available children
                        Object.keys(tags).filter(
                            (tag_id) => tag_id != modify_data.parent && tag_id != modify_data.name
                        ).map((tag_id) => {
                            return (
                                <SelectItem key={tag_id} textValue={tag_id}>
                                    <PlainTagElement tag_id={tag_id}/>
                                </SelectItem>
                        )})
                    }
                </Select>
                </AnimatePresence>
                
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="secondary" onPress={() =>{
                    if (validateTagName(modify_data.name) === "" && modify_data.color !== "") {
                        console.log("Valid tag data", modify_data)
                        // Tag is valid, so we can dispatch the action to create/modify the tag
                        dispatch(modifyTagMetadata({tag_id: modify_data.name, tag_data: {
                            name: modify_data.name,
                            color: modify_data.color,
                            aliases: modify_data.aliases,
                            parent: modify_data.parent,
                            children: modify_data.children
                        }}))
                        // Update all tagged files with the new tag information
                        
                        dispatch(resetQueriedTags());
                        onClose();
                    } else {
                        // Update error messages for all fields
                        dispatch(setModifyingTagData({...modify_data, blurred_name: true, blurred_color: true}));
                    }
                }}>
                  {modify_data.is_new ? "Create" : "Save"}
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