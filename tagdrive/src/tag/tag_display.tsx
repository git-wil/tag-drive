import "../editor/Editor.css";
import {
    Autocomplete,
    AutocompleteItem,
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
} from "@nextui-org/react";
import { GoogleFile } from "../drive/google_types.js";
import { TagID } from "./tag_types.js";
import { addTagToFileID, getFileTagsByID, getTagByID, getTagMetadata } from "./tags_slice.js";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import { appendSelectedFile, clearSelectedFiles, getDraggedOver, getFiles, getFilesLoaded, getSelectedFile, getSelectedFiles, isSelectedFile, removeSelectedFile, resetDraggedOver, setDraggedOver, setSelectedFile, setSelectedFiles, toggleSelectedFile } from "../drive/files_slice.js";
import { useState } from "react";
import { getTypedTags, getValue, setTypedTags, setValue } from "./tag_search_slice.js";

import { motion } from "framer-motion";

import Fuse from "fuse.js";


export const TAG_FILE_NAME = "TagOperatorOfficialTagList.json";


export function TagSearchBox(props: {[popover_id: string]: string}) {
    const dispatch = useAppDispatch();
    const popover_id = props.popover_id;
    const [hidden, setHidden] = useState(true);
    const typed_tags = useAppSelector(getTypedTags);
    const tags = useAppSelector(getTagMetadata);
    const value = useAppSelector(getValue);
    return (
        <div className={"items-center justify-center"}>
            <Input
                variant="bordered"
                label={<div className= "my-1.5">Search</div>}
                placeholder={typed_tags.length == 0 ? "Type a tag or file name..." : ""}
                isClearable
                classNames={{
                    base: "h-full",
                    mainWrapper: "h-full",
                    inputWrapper: "h-[65px]",
                    input: "mb-0.5 text-md"
                }}
                labelPlacement="inside"
                startContent={<div className="flex gap-2">
                    {
                        typed_tags.map((tag_id) => (
                            <DraggableTagElement tag_id={tag_id} key={tag_id}/>
                        ))
                    }
                </div>}
                onFocus={() => {
                    console.log("Hidden False")
                    setHidden(false);
                    
                }}
                onBlur={() => {
                    console.log("Hidden true")
                    setHidden(true);
                }}
                value={value}
                onValueChange={
                    (value) => {
                        dispatch(setValue(value))
                        if (Object.keys(tags).includes(value)) {
                            dispatch(setTypedTags([...typed_tags, value]));
                            dispatch(setValue(""));

                        }
                    }
                }
                onKeyDown={(e) => {
                    if (e.key === "Backspace" && typed_tags.length > 0 && value === "") {
                        dispatch(setTypedTags(typed_tags.slice(0, typed_tags.length - 1)));
                    }
                }}
            />
            {/* <Card id={popover_id} hidden={hidden} className="absolute w-full z-50 bg-transparent shadow-none    " >
                <div className="mx-2 my-0.5 z-50 min-w-[300px] w-1/3 bg-default-200 rounded-2xl px-4 py-2 shadow-xl">Test</div>
            </Card> */}
            
        </div>
    );

}

function TagElement(props: {tag_id: TagID}) {
    const tag_id = props.tag_id;
    const tag = useAppSelector((state) => getTagByID(state, tag_id));
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

function DraggableTagElement(props: {tag_id: TagID}) {
    const dispatch = useAppDispatch();
    const tag_id = props.tag_id;
    const tag = useAppSelector((state) => getTagByID(state, tag_id));
    const files = useAppSelector(getFiles);
    const files_loaded = useAppSelector(getFilesLoaded);
    const dragged_over = useAppSelector(getDraggedOver);
    const selected_files = useAppSelector(getSelectedFiles);
    if (!files_loaded) {
        return <div></div>;
    }
    return (
        <div 
        draggable
        onDrag={(e) => {
            e.preventDefault();
            e.dataTransfer.setData("tag", tag_id);
            e.dataTransfer.dropEffect = "copy";
        }}
        onDragEnd={() => {
            dragged_over.forEach((file_index) => {
                dispatch(addTagToFileID({tag_id: tag_id, file_id: files[file_index].id}))
            });
            // TODO: Consider clearing selected files after drag?
            // if (dragged_over == selected_files) {
            //     dispatch(clearSelectedFiles());
            // }
            dispatch(resetDraggedOver());
        }}
        className={`flex h-[30px] w-fit pt-1.5 pe-3 ps-1 bg-${tag.color} rounded-full cursor-move tag-element`}>
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
        </div>
    );
}

export function FileCard(props: {file: GoogleFile | null, index: number}) {
    const dispatch = useAppDispatch();
    const file = props.file;
    const index = props.index;
    const file_name = file?.name;
    // TODO: Show in top right corner?
    // const file_type = file?.mimeType;
    const dragged_over_index = useAppSelector(getDraggedOver);
    const selected_files = useAppSelector(getSelectedFiles);
    const is_selected = useAppSelector(isSelectedFile(index));

    const last_selected_file = selected_files.length > 0 ? selected_files[selected_files.length - 1] : null;
    // TODO: use thumbnailLink instead of iconLink, google drive just
    // hates me sometimes and doesn't want to display thumbnails
    const thumbnail_link = file?.thumbnailLink
    // const thumbnail_link = file?.iconLink;
    const file_tag_ids = useAppSelector((state) => getFileTagsByID(state, file?.id || "")) || {tags: []};
    return (
            <Card
                isBlurred={false}
                isPressable
                isHoverable
                disableRipple
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
                        if (index > last_selected_file) {
                            for (let i = last_selected_file+1; i <= index; i++) {
                                dispatch(toggleSelectedFile(i));
                            }
                        } else {
                            for (let i = index; i < last_selected_file; i++) {
                                dispatch(toggleSelectedFile(i));
                            }
                        }
                    } else {
                        dispatch(clearSelectedFiles());
                        dispatch(appendSelectedFile(index));
                    }
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    if (selected_files.length > 0 && selected_files.includes(index)) {
                        // Add tag to all selected files
                        dispatch(setDraggedOver(selected_files));
                    } else {
                        dispatch(setDraggedOver([index]));
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                }}
                className={`border-none bg-zinc-900 rounded-2xl ${
                    is_selected ? "ring-2 ring-primary-400" : ""
                } ${
                    dragged_over_index.includes(index) ? "ring-2 ring-secondary-500" : ""
                }`}>
                <div className="w-full h-full items-center justify-center p-2">
                    <Skeleton
                        isLoaded={file !== null}
                        className="rounded-t-lg"
                    >
                        <div className="overflow-hidden w-full h-[200px] place-content-center bg-zinc-700 rounded-t-md">
                            <Image
                                alt={file_name}
                                src={thumbnail_link}
                                loading="eager"
                                disableSkeleton
                                // crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                className="rounded-t-md object-cover h-[200px] w-full"
                            />
                        </div>
                    </Skeleton>
                    <Skeleton
                        isLoaded={file !== null}
                        className="rounded-b-lg"
                    >
                        <h3 className="truncate w-full h-[30px] bg-zinc-700 rounded-b-md py-1 px-3 font-medium">{file_name}</h3>
                    </Skeleton>
                    <Spacer y={3}/>
                    <Skeleton
                        isLoaded={file !== null}
                        className="rounded-lg"
                    >   
                        <TagCard tag_ids={file_tag_ids.tags}/>
                    </Skeleton>
                </div>
            </Card>
    );
}



export function AddTagsCard() {

    const selectedFile = useAppSelector(getSelectedFile);
    const tags = useAppSelector(getTagMetadata);
    return (
        <Autocomplete
        variant="bordered"
        label="Add a tag" >
            {
                Object.entries(tags).map(([tag_id, tag]) => (
                    <AutocompleteItem key={tag_id} value={tag.name}>
                        {tag.name}
                    </AutocompleteItem>
                ))
            }
        </Autocomplete>
        // <Card
        //     className="flex-row flex-wrap overflow-auto border-none bg-zinc-700 h-[90px] w-full rounded-md p-2 gap-2">
            
        // </Card>
    );
}

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