import "../editor/Editor.css";
import {
    Button,
    Card,
    Input,
    Skeleton,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem,
} from "@nextui-org/react";
import { Tag, TagID } from "./tag_types.js";
// import { addTagToFileID, deleteTagMetadata, getFileTags, getFileTagsByID, getModifyingTagData, getQueriedTags, getTagByID, getTagMetadata, modifyTagMetadata, removeTagFromFileID, resetQueriedTags, setModifyingTagData, setQueriedTags } from "../store/slice_tags_old.ts";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
// import { appendSelectedFile, appendSelectedFilesBetween, clearSelectedFiles, getDraggedOver, getDragging, getFiles, getFilesLoaded, getQueriedFiles, getSelectedFiles, getVisibleFiles, isSelectedFile, resetDraggedOver, resetDragging, setDraggedOver, setDragging, setQueriedFiles, setSelectedFiles, toggleSelectedFile } from "../store/slice_files_old.ts";
import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import Fuse from "fuse.js";

import { TAG_COLORS } from "../assets/constants.js";
import { areDriveFilesLoaded } from "../store/slice_editor.js";
import {
    clearSelectedTagIndices,
    getQueriedTags,
    getSelectedTagIndices,
    getTagByID,
    getTagList,
    getVisibleTagApplier,
    getVisibleTagApplierTags,
    isTagSelected,
    queryAllTags,
    setQueriedTags,
    toggleSelectedTagIndex,
} from "../store/slice_tags.js";
import { removeTagFromFile } from "../store/slice_files.js";

// export function FileSearchBox() {
//     const dispatch = useAppDispatch();
//     const files = useAppSelector(getDriveFiles);
//     const file_tags = useAppSelector(getFileTagMap);
//     const files_loaded = useAppSelector(areDriveFilesLoaded);

//     return (
//         <Input
//             variant="bordered"
//             placeholder="Filter files by name or tag..."
//             isClearable
//             labelPlacement="inside"
//             isDisabled={!files_loaded}
//             id="fileSearchBox"
//             classNames={{
//                 base: "h-full",
//                 mainWrapper: "h-full",
//                 inputWrapper:
//                     "h-[50px] caret-primary-400 group-data-[focus=true]:border-primary-600 border-primary-800/50 data-[hover=true]:border-primary-600/50",
//                 input: "text-md placeholder:text-primary-800/60",
//             }}
//             startContent={
//                 <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     strokeWidth={1.5}
//                     stroke="hsl(var(--nextui-primary-900))"
//                     className="size-4"
//                 >
//                     <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
//                     />
//                 </svg>
//             }
//             onValueChange={(value) => {
//                 if (value === "") {
//                     dispatch(queryAllFiles());
//                     return;
//                 }
//                 const fuse = new Fuse(files, {
//                     keys: ["data"],
//                     ignoreLocation: true,
//                     useExtendedSearch: true,
//                     // includeScore: true,
//                     getFn: (file: GoogleFile) => {
//                         return (
//                             file.name +
//                             (file_tags[file.id] || { search_string: "" })
//                                 .search_string
//                         );
//                     },
//                     threshold: 0.5,
//                 }).search(value);
//                 dispatch(setQueriedFiles(fuse.map((result) => result.item)));
//                 document
//                     .getElementById("super-file-card-container")
//                     ?.scrollTo({ top: 0, behavior: "instant" });
//             }}
//         />
//     );
// }

// Old file search box
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

enum TagElementType {
    SIDEBAR,
    FILE,
}

export function DefaultTagElement(props: {
    tag_id: TagID;
    type: TagElementType;
    hover_button_callback: () => void;
}) {
    const dispatch = useAppDispatch();
    const tag_id = props.tag_id;
    const display_type = props.type;
    const tag = useAppSelector(getTagByID(tag_id));
    const [hoverButtonVisible, setHoverButtonVisible] = useState(false);
    const tagSelected = useAppSelector(isTagSelected(tag_id));

    return (
        <Skeleton
            isLoaded={tag !== undefined}
            className="h-fit rounded-full w-fit max-w-full"
            classNames={{
                base: "bg-secondary-700/50 before:via-secondary-700/60",
            }}
        >
            {!tag ? (
                <div className={`h-[30px] rounded-full w-[100px]`} />
            ) : (
                <motion.div
                    // Only show the tap animation if the element is a in the sidebar
                    whileTap={{
                        scale:
                            display_type === TagElementType.SIDEBAR ? 0.97 : 1,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "easeInOut",
                        duration: 0.2,
                    }}
                    exit={{ scale: 0 }}
                    onHoverStart={() => setHoverButtonVisible(true)}
                    onClick={() => {
                        // Select the tag
                        if (display_type === TagElementType.SIDEBAR) {
                            dispatch(toggleSelectedTagIndex(tag_id));
                        }
                    }}
                    onHoverEnd={() => setHoverButtonVisible(false)}
                    className={
                        `flex h-fit w-fit max-w-full z-25 px-3 py-1 outline-none ` +
                        `bg-${tag.color} rounded-full tag-element align-center select-none ` +
                        (display_type === TagElementType.SIDEBAR && tagSelected
                            ? "ring-2 ring-primary-800 ring-inset"
                            : "")
                    }
                >
                    <h6 className="text-sm h-fit w-fit drop-shadow truncate select-none">
                        {tag.name}
                    </h6>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileTap={{
                            scale: 1.1,
                        }}
                        onClick={(e) => {
                            console.log("Clicked");
                            props.hover_button_callback();
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        animate={{
                            opacity: hoverButtonVisible ? 1 : 0,
                            translateX: hoverButtonVisible ? "2px" : "-15px",
                            width: hoverButtonVisible ? "15px" : "0px",
                        }}
                        transition={{ duration: 0.1 }}
                        className="m-auto select-none"
                    >
                        {display_type === TagElementType.SIDEBAR ? (
                            // If the tag is in the sidebar, show the expand/collapse button
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            </svg>
                        ) : (
                            // If the tag is in a file card, show the remove button
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`size-4`}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </Skeleton>
    );
}

function PlainTagElement(props: { tag_id: TagID }) {
    const tag_id = props.tag_id;
    const tag = useAppSelector(getTagByID(tag_id));
    const files_loaded = useAppSelector(areDriveFilesLoaded);
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                type: "easeInOut",
                duration: 0.2,
            }}
            exit={{ opacity: 0 }}
            className={`h-[30px] w-fit min-w-fit pt-1.5 p-2 px-3 bg-${tag.color} rounded-full`}
        >
            <h6 className="text-sm h-fit drop-shadow text-default-700">
                {tag.name}
            </h6>
        </motion.div>
    );
}

/**
 * A card element that contains multiple tags for a single file
 * @param props The properties of the TagCard component, which include the tag_ids and the file_index
 * @returns
 */
export function TagCard(props: {
    tag_ids: TagID[];
    file_index: number | undefined;
    file_id: string | undefined;
}) {
    const dispatch = useAppDispatch();
    const tag_ids = [...props.tag_ids];
    return (
        <Card className="flex-row flex-wrap overflow-auto border-none bg-primary-600/15 h-[90px] w-full rounded-md p-2 gap-2">
            <AnimatePresence>
                {tag_ids.sort().map((tag_id) => (
                    <DefaultTagElement
                        key={tag_id}
                        tag_id={tag_id}
                        type={TagElementType.FILE}
                        // TODO: Set remove callback
                        hover_button_callback={() => {
                            console.log("In remove callback");
                            if (
                                props.file_index !== undefined &&
                                props.file_id
                            ) {
                                console.log(
                                    "Removing tag " +
                                        tag_id +
                                        " from file " +
                                        props.file_id,
                                );
                                dispatch(
                                    removeTagFromFile({
                                        file_id: props.file_id,
                                        tag_id: tag_id,
                                    }),
                                );
                            }
                        }}
                    />
                ))}
            </AnimatePresence>
        </Card>
    );
}

export function TagElementSidebarContainer(props: {
    tag_id: TagID;
    modify_modal_onOpen: () => void;
}) {
    const [open, setOpen] = useState(true);
    const [animationOver, setAnimationOver] = useState(false);
    const [pressed, setPressed] = useState(false);
    const tag_id = props.tag_id;
    const tag = useAppSelector(getTagByID(tag_id));

    return (
        <div className="gap-4 h-full w-full select-none">
            <motion.div
                animate={{
                    scale: pressed ? 0.99 : 1,
                }}
                className={`flex flex-row gap-2 w-full items-center rounded-md bg-secondary-700/20 p-1.5 select-none`}
            >
                <div className="flex-1 w-1 select-none">
                    <DefaultTagElement
                        tag_id={props.tag_id}
                        type={TagElementType.SIDEBAR}
                        // TODO: Set edit callback
                        hover_button_callback={() => {}}
                        // modify_modal_onOpen={props.modify_modal_onOpen}
                    />
                </div>
                {tag && tag.children.length > 0 ? (
                    // If the tag has children, show the expand/collapse button
                    <motion.svg
                        initial={{
                            rotate: -180,
                        }}
                        whileHover={{
                            scale: 1.1,
                        }}
                        whileTap={{
                            scale: 0.9,
                        }}
                        onTapStart={() => setPressed(true)}
                        animate={{
                            rotate: open ? 90 : 180,
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
                        stroke="hsl(var(--nextui-secondary-600))"
                        className={
                            "size-4 -me-0.5 active:outline-none focus:outline-none flex-none select-none"
                        }
                        tabIndex={-1}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                    </motion.svg>
                ) : (
                    <></>
                )}
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
                className="gap-2 select-none"
            >
                {!animationOver &&
                    tag &&
                    tag.children.map((child_id) => (
                        <div key={child_id} className="ps-5 pt-2 select-none">
                            <TagElementSidebarContainer
                                tag_id={child_id}
                                key={child_id}
                                modify_modal_onOpen={props.modify_modal_onOpen}
                            />
                        </div>
                    ))}
            </motion.div>
        </div>
    );
}

export function TagSidebar() {
    // Tag create/modify modal open state
    const dispatch = useAppDispatch();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const queried_tags = useAppSelector(getQueriedTags);
    const [blurText, setBlurText] = useState("");
    const selected_tags = useAppSelector(getSelectedTagIndices);

    return (
        <div className="relative w-full flex flex-col h-full rounded-2xl overflow-hidden">
            <AnimatePresence>
                <motion.div
                    key={1}
                    className="absolute m-auto cursor-auto left-0 right-0 top-0 bottom-0 w-[200px] h-[60px] rounded-lg text-base text-secondary-600/50"
                >
                    {blurText}
                </motion.div>
                <NewTagElement key={2} modify_modal_onOpen={onOpen} />
                <motion.div
                    id="tag-panel"
                    key="tag-panel"
                    dir="rtl"
                    className={
                        "w-full h-full overflow-auto flex-1 rounded-2xl bg-secondary-600/15"
                    }
                    // style={{
                    //     filter:
                    //         dragging_metadata.type !== "" ? "blur(5px)" : "",
                    //     transition: "filter 0.2s ease-in-out",
                    // }}
                    transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                    }}
                >
                    <div
                        id="tag-panel-inner"
                        dir="ltr"
                        className="grid gap-2 p-3 grid-cols-1"
                    >
                        {queried_tags
                            .filter((tag) => tag === null || tag.parent === "")
                            .map((tag, index) => {
                                return (
                                    <TagElementSidebarContainer
                                        key={index}
                                        tag_id={tag !== null ? tag.id : ""}
                                        modify_modal_onOpen={onOpen}
                                    />
                                );
                            })}
                    </div>
                </motion.div>
            </AnimatePresence>
            <motion.div
                whileTap={{
                    scale: 0.95,
                }}
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: selected_tags.length > 0 ? 1 : 0,
                    translateY: selected_tags.length > 0 ? "0px" : "30px",
                }}
                transition={{
                    duration: 0.3,
                    delay: 0.2,
                }}
                onClick={() => {
                    dispatch(clearSelectedTagIndices());
                }}
                className={
                    "flex absolute m-auto left-0 right-0 bottom-0 " +
                    "justify-center w-2/5 min-w-fit max-w-2/5 p-2 bg-secondary-600/90 rounded-t-2xl " +
                    "cursor-pointer select-none"
                }
            >
                Deselect All
            </motion.div>
            <TagModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </div>
    );
}

export function TagSearchBox() {
    const dispatch = useAppDispatch();
    const tags = useAppSelector(getTagList);
    const tag_values = Object.values(tags);
    const files_loaded = useAppSelector(areDriveFilesLoaded);
    return (
        <div className="h-fit">
            <Input
                variant="bordered"
                placeholder="Filter tags..."
                isClearable
                isDisabled={!files_loaded}
                labelPlacement="inside"
                classNames={{
                    base: "h-fit",
                    mainWrapper: "h-fit",
                    inputWrapper:
                        "h-[50px] caret-secondary-400 group-data-[focus=true]:border-secondary-600 border-secondary-800/50 data-[hover=true]:border-secondary-600/50",
                    input: "text-md placeholder:text-secondary-700/55",
                }}
                startContent={
                    // <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="hsl(var(--nextui-primary-900))" className="size-4">
                    //     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    // </svg>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="hsl(var(--nextui-primary-900))"
                        className="size-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                        />
                    </svg>
                }
                onValueChange={(value) => {
                    if (value === "") {
                        dispatch(queryAllTags());
                        return;
                    }
                    const fuse = new Fuse<Tag>(tag_values, {
                        keys: ["name", "aliases"],
                        ignoreLocation: true,
                        useExtendedSearch: true,
                        // includeScore: true,
                        threshold: 0.5,
                    }).search(value);
                    const direct_queried_tags: Tag[] = fuse.map(
                        (result) => result.item,
                    );
                    const all_queried_tags = [
                        ...new Set(
                            direct_queried_tags.concat(
                                direct_queried_tags.flatMap((tag) =>
                                    getAllParentTags(tag, tags),
                                ),
                            ),
                        ),
                    ];
                    dispatch(setQueriedTags(all_queried_tags));
                    document
                        .getElementById("tag-panel")
                        ?.scrollTo({ top: 0, behavior: "instant" });
                }}
            />
        </div>
    );
}

export function SelectedTagsPopup() {
    // const dispatch = useAppDispatch();
    const drive_files_loaded = useAppSelector(areDriveFilesLoaded);
    const tag_applier = useAppSelector(getVisibleTagApplier);
    const applier_tags = useAppSelector(getVisibleTagApplierTags);
    const visible = applier_tags.length > 0 && drive_files_loaded;
    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: visible ? 1 : 0,
                translateY: visible ? "0px" : "30px",
            }}
            transition={{
                duration: 0.2,
            }}
            className={
                "flex sticky m-auto left-0 right-0 -bottom-1 " +
                "w-5/6 h-[50px] py-2 px-4 z-10 bg-primary-50/85 " +
                "rounded-t-2xl select-none gap-6"
            }
        >
            <div className="flex gap-1 justify-start min-w-fit">
                {tag_applier === "click" ? (
                    <h5 className="text-large text-secondary-700 font-semibold">
                        Click
                    </h5>
                ) : (
                    <h5 className="text-large text-secondary-700 font-semibold">
                        {"Press " + tag_applier}
                    </h5>
                )}
                <h5 className="text-large text-primary-900"> to apply tags:</h5>
            </div>
            <div className="flex gap-2 w-fit my-auto justify-start rounded-2xl overflow-x-auto">
                <AnimatePresence>
                    {applier_tags.map((tag_id) => (
                        <PlainTagElement key={tag_id} tag_id={tag_id} />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function getAllParentTags(tag: Tag, tags: { [key: string]: Tag }): Tag[] {
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

export function NewTagElement(props: { modify_modal_onOpen: () => void }) {
    const dispatch = useAppDispatch();
    const files_loaded = useAppSelector(areDriveFilesLoaded);
    return (
        <Skeleton
            isLoaded={files_loaded}
            className="rounded-lg mb-1.5"
            classNames={{
                base: "bg-secondary-700/50 before:via-secondary-700/60",
            }}
        >
            <div className="gap-4">
                <Button
                    fullWidth
                    className={`flex flex-row gap-2 rounded-md bg-secondary-600/60 p-1.5`}
                    isDisabled={!files_loaded}
                    // onClick={() => {
                    //     dispatch(
                    //         setModifyingTagData({
                    //             name: "",
                    //             color: "",
                    //             aliases: [],
                    //             children: [],
                    //             parent: "",
                    //             is_new: true,
                    //             blurred_name: false,
                    //             blurred_color: false,
                    //         }),
                    //     );
                    //     props.modify_modal_onOpen();
                    // }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className={
                            "size-4 -me-0.5 active:outline-none focus:outline-none"
                        }
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                    <div className="h-[30px] text-base py-1 text-primary-900">
                        New Tag
                    </div>
                </Button>
            </div>
        </Skeleton>
    );
}

export function TagModal(props: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const dispatch = useAppDispatch();
    const isOpen = props.isOpen;
    const onOpenChange = props.onOpenChange;
    const tags = {}; //useAppSelector(getTagMetadata);

    const modify_data = {}; //useAppSelector(getModifyingTagData);

    const validateTagName = (name: string) => {
        if (name === "") {
            return "Tag name cannot be empty";
        } else if (modify_data.is_new && Object.keys(tags).includes(name)) {
            return "Tag name already exists";
        }
        return "";
    };

    const tagNameValid =
        modify_data.blurred_name && validateTagName(modify_data.name) !== "";

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                return onOpenChange(open);
            }}
            backdrop="blur"
            motionProps={{
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.5 },
                transition: {
                    duration: 0.1,
                    ease: "easeInOut",
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                },
            }}
            classNames={{
                body: "",
            }}
            onClose={() => {
                dispatch(
                    setModifyingTagData({
                        name: "",
                        color: "",
                        aliases: [],
                        children: [],
                        parent: "",
                        is_new: true,
                        blurred_name: false,
                        blurred_color: false,
                    }),
                );
                setDeleteModalOpen(false);
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className={`flex flex-col gap-2`}>
                            {" "}
                            {modify_data.is_new
                                ? "Create New Tag"
                                : "Modify Tag"}
                        </ModalHeader>
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
                                errorMessage={
                                    modify_data.blurred_name
                                        ? validateTagName(modify_data.name)
                                        : ""
                                }
                                onValueChange={(value) => {
                                    dispatch(
                                        setModifyingTagData({
                                            ...modify_data,
                                            name: value,
                                        }),
                                    );
                                }}
                                onBlur={() => {
                                    dispatch(
                                        setModifyingTagData({
                                            ...modify_data,
                                            blurred_name: true,
                                        }),
                                    );
                                }}
                                classNames={{
                                    input: `${
                                        tagNameValid
                                            ? "placeholder:text-danger"
                                            : ""
                                    }`,
                                }}
                            ></Input>
                            <Select
                                id="tag-color-select"
                                isRequired
                                variant="faded"
                                label="Tag Color"
                                placeholder="Select a color..."
                                selectedKeys={
                                    modify_data.color ? [modify_data.color] : []
                                }
                                onChange={(e) => {
                                    dispatch(
                                        setModifyingTagData({
                                            ...modify_data,
                                            color: e.target.value,
                                        }),
                                    );
                                }}
                                onBlur={() => {
                                    dispatch(
                                        setModifyingTagData({
                                            ...modify_data,
                                            blurred_color: true,
                                        }),
                                    );
                                }}
                                isInvalid={
                                    modify_data.blurred_color &&
                                    modify_data.color === ""
                                }
                                errorMessage={
                                    modify_data.blurred_color &&
                                    modify_data.color === ""
                                        ? "Please select a color"
                                        : ""
                                }
                                renderValue={(colors) => {
                                    return colors.map((color_data) => {
                                        // @ts-expect-error - This is a valid check, the color data is always the name of the color tag
                                        const color: string = color_data.key;
                                        const upper_color_name =
                                            color_data.textValue;
                                        return (
                                            <div
                                                key={color_data.key}
                                                className="flex gap-1.5 items-center"
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded-full bg-${color}`}
                                                ></div>
                                                <div className="text-sm text-default-600">
                                                    {upper_color_name}
                                                </div>
                                            </div>
                                        );
                                    });
                                }}
                            >
                                {TAG_COLORS.map((color) => {
                                    const color_name = color.split("-")[0];
                                    const upper_color_name =
                                        color_name.charAt(0).toUpperCase() +
                                        color_name.slice(1);
                                    return (
                                        <SelectItem
                                            key={color}
                                            textValue={upper_color_name}
                                        >
                                            <div className="flex gap-2 items-center">
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-${color}`}
                                                ></div>
                                                <div className="text-base">
                                                    {upper_color_name}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </Select>
                            <Input
                                id="tag-aliases-input"
                                variant="faded"
                                label="Tag Aliases"
                                placeholder="Enter alternate tag aliases separated by spaces..."
                                defaultValue={modify_data.aliases.join(" ")}
                                onValueChange={(value) => {
                                    dispatch(
                                        setModifyingTagData({
                                            ...modify_data,
                                            aliases: value.split(" "),
                                        }),
                                    );
                                }}
                            ></Input>
                            <Select
                                id="tag-parent-select"
                                variant="faded"
                                label="Tag Parent"
                                placeholder="Assign another tag as a parent..."
                                selectedKeys={
                                    modify_data.parent
                                        ? [modify_data.parent]
                                        : []
                                }
                                onChange={(e) => {
                                    // If the parent is a child of the tag, remove it as a children
                                    if (
                                        modify_data.children.includes(
                                            e.target.value,
                                        )
                                    ) {
                                        console.log("Removing parent as child");
                                        dispatch(
                                            setModifyingTagData({
                                                ...modify_data,
                                                parent: e.target.value,
                                                children:
                                                    modify_data.children.filter(
                                                        (child) =>
                                                            child !==
                                                            e.target.value,
                                                    ),
                                            }),
                                        );
                                    } else {
                                        dispatch(
                                            setModifyingTagData({
                                                ...modify_data,
                                                parent: e.target.value,
                                            }),
                                        );
                                    }
                                }}
                                size="lg"
                                classNames={{
                                    label: "text-sm -mt-4",
                                }}
                                renderValue={(selected_tags) => {
                                    return selected_tags.map((tag_data) => {
                                        // @ts-expect-error - This is a valid check, the color data is always the name of the color tag
                                        const tag_id: string = tag_data.key;
                                        return (
                                            <PlainTagElement
                                                key={tag_id}
                                                tag_id={tag_id}
                                            />
                                        );
                                    });
                                }}
                            >
                                {
                                    // Filter out the current tag from the list of available parents
                                    Object.keys(tags)
                                        .filter(
                                            (tag_id) =>
                                                tag_id != modify_data.name,
                                        )
                                        .map((tag_id) => {
                                            return (
                                                <SelectItem
                                                    key={tag_id}
                                                    textValue={tag_id}
                                                >
                                                    <PlainTagElement
                                                        tag_id={tag_id}
                                                    />
                                                </SelectItem>
                                            );
                                        })
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
                                    onChange={(e) => {
                                        dispatch(
                                            setModifyingTagData({
                                                ...modify_data,
                                                children:
                                                    e.target.value.split(","),
                                            }),
                                        );
                                    }}
                                    size="lg"
                                    classNames={{
                                        label: "text-sm -mt-4",
                                    }}
                                    renderValue={(selected_tags) => {
                                        return selected_tags.length > 0 ? (
                                            <div className="flex gap-2">
                                                {selected_tags.map(
                                                    (tag_data) => {
                                                        // @ts-expect-error - This is a valid check, the color data is always the name of the color tag
                                                        const tag_id: string =
                                                            tag_data.key;
                                                        return (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0.5,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    scale: 1,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    scale: 0.5,
                                                                }}
                                                                transition={{
                                                                    type: "spring",
                                                                    stiffness: 260,
                                                                    damping: 20,
                                                                }}
                                                                key={tag_id}
                                                            >
                                                                <PlainTagElement
                                                                    key={tag_id}
                                                                    tag_id={
                                                                        tag_id
                                                                    }
                                                                />
                                                            </motion.div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                Assign tags as children...
                                            </div>
                                        );
                                    }}
                                >
                                    {
                                        // Filter out the current tag and the parent from the list of available children
                                        Object.keys(tags)
                                            .filter(
                                                (tag_id) =>
                                                    tag_id !=
                                                        modify_data.parent &&
                                                    tag_id != modify_data.name,
                                            )
                                            .map((tag_id) => {
                                                return (
                                                    <SelectItem
                                                        key={tag_id}
                                                        textValue={tag_id}
                                                    >
                                                        <PlainTagElement
                                                            tag_id={tag_id}
                                                        />
                                                    </SelectItem>
                                                );
                                            })
                                    }
                                </Select>
                            </AnimatePresence>
                        </ModalBody>
                        <ModalFooter>
                            <div className="flex justify-between w-full gap-2">
                                {modify_data.is_new ? (
                                    <div></div>
                                ) : (
                                    <div id="delete-tag">
                                        <Button
                                            color="danger"
                                            variant="shadow"
                                            onPress={() =>
                                                setDeleteModalOpen(true)
                                            }
                                        >
                                            Delete
                                        </Button>
                                        <AnimatePresence>
                                            {deleteModalOpen && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 260,
                                                        damping: 20,
                                                        duration: 0.2,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0,
                                                    }}
                                                    className={
                                                        "absolute w-3/4 h-fit m-auto left-0 right-0 top-0" +
                                                        " bottom-0 bg-danger z-50 items-center justify-center rounded-xl" +
                                                        " text-danger-foreground shadow-xl shadow-danger/40 flex flex-col p-5"
                                                    }
                                                >
                                                    <div className="p-5">
                                                        <span className="font-semibold text-lg">
                                                            Are you sure you
                                                            want to delete
                                                        </span>
                                                        <span className="ps-1 w-1/5 font-[750] text-lg">
                                                            "{modify_data.name}"
                                                        </span>
                                                        <span className="font-semibold text-lg">
                                                            ? All child tags
                                                            will be separated as
                                                            new tags. This
                                                            action cannot be
                                                            undone.
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-row gap-10">
                                                        <Button
                                                            autoFocus
                                                            variant="flat"
                                                            className="bg-danger-50/40"
                                                            onPress={() => {
                                                                setDeleteModalOpen(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="flat"
                                                            className="bg-danger-50/90"
                                                            onPress={() => {
                                                                dispatch(
                                                                    deleteTagMetadata(
                                                                        modify_data.name,
                                                                    ),
                                                                );
                                                                dispatch(
                                                                    resetQueriedTags(),
                                                                );
                                                                onClose();
                                                            }}
                                                        >
                                                            Confirm
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={() => {
                                            onClose();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onPress={() => {
                                            if (
                                                validateTagName(
                                                    modify_data.name,
                                                ) === "" &&
                                                modify_data.color !== ""
                                            ) {
                                                console.log(
                                                    "Valid tag data",
                                                    modify_data,
                                                );
                                                // Tag is valid, so we can dispatch the action to create/modify the tag
                                                dispatch(
                                                    modifyTagMetadata({
                                                        tag_id: modify_data.name,
                                                        tag_data: {
                                                            name: modify_data.name,
                                                            color: modify_data.color,
                                                            aliases:
                                                                modify_data.aliases,
                                                            parent: modify_data.parent,
                                                            children:
                                                                modify_data.children,
                                                        },
                                                    }),
                                                );
                                                // Update all tagged files with the new tag information

                                                dispatch(resetQueriedTags());
                                                onClose();
                                            } else {
                                                // Update error messages for all fields
                                                dispatch(
                                                    setModifyingTagData({
                                                        ...modify_data,
                                                        blurred_name: true,
                                                        blurred_color: true,
                                                    }),
                                                );
                                            }
                                        }}
                                    >
                                        {modify_data.is_new ? "Create" : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
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
