import "../editor/Editor.css";
import { Input, Skeleton, Spacer, Tooltip, Image } from "@nextui-org/react";
import Fuse from "fuse.js";
import { GoogleFile } from "../drive/google_types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
    appendSelectedFileIndex,
    appendSelectedFileIndicesBetween,
    areDriveFilesLoaded,
    clearSelectedFileIndices,
    getDriveFiles,
    getQueriedFiles,
    getSelectedFileIndices,
    getVisibleFileCount,
    isFileIndexSelected,
    queryAllFiles,
    setQueriedFiles,
    setSelectedFileIndices,
    toggleSelectedFileIndex,
} from "../store/slice_editor";
import {
    addTagsToFiles,
    getFileTagMap,
    getFileTagsByID,
} from "../store/slice_files";
import { motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { file_columns } from "../assets/constants";
import { getCurrentBreakpoint } from "../editor/get_screen_break";
import { TagCard } from "../tag/tag_display";
import {
    getVisibleTagApplier,
    getVisibleTagApplierTags,
} from "../store/slice_tags";

export function FileSearchBox() {
    const dispatch = useAppDispatch();
    const files = useAppSelector(getDriveFiles);
    const file_tags = useAppSelector(getFileTagMap);
    const files_loaded = useAppSelector(areDriveFilesLoaded);

    return (
        <Input
            variant="bordered"
            placeholder="Filter files by name or tag..."
            isClearable
            labelPlacement="inside"
            // TODO: Edit this after cached loading exists
            isDisabled={!files_loaded}
            id="fileSearchBox"
            classNames={{
                base: "h-full",
                mainWrapper: "h-full",
                inputWrapper:
                    "h-[50px] caret-primary-400 group-data-[focus=true]:border-primary-600 border-primary-800/50 data-[hover=true]:border-primary-600/50",
                input: "text-md placeholder:text-primary-800/60",
            }}
            startContent={
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
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                </svg>
            }
            onValueChange={(value) => {
                if (value === "") {
                    dispatch(queryAllFiles());
                    return;
                }
                const fuse = new Fuse(files, {
                    keys: ["data"],
                    ignoreLocation: true,
                    useExtendedSearch: true,
                    // includeScore: true,
                    getFn: (file: GoogleFile) => {
                        return (
                            file.name +
                            (file_tags[file.id] || { search_string: "" })
                                .search_string
                        );
                    },
                    threshold: 0.5,
                }).search(value);
                dispatch(setQueriedFiles(fuse.map((result) => result.item)));
                document
                    .getElementById("super-file-card-container")
                    ?.scrollTo({ top: 0, behavior: "instant" });
            }}
        />
    );
}

export function FileCardContainer() {
    const dispatch = useAppDispatch();
    const queried_files = useAppSelector(getQueriedFiles);
    const visible_file_count = useAppSelector(getVisibleFileCount);
    const selected_file_indices = useAppSelector(getSelectedFileIndices);
    // const first_selected_file = selected_files.length > 0 ? selected_files[0] : null;
    const last_selected_file =
        selected_file_indices.length > 0
            ? selected_file_indices[selected_file_indices.length - 1]
            : null;

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
        "/",
    ];

    const screen_break = getCurrentBreakpoint();
    const column_number: number = file_columns[screen_break];

    const ref = useHotkeys(
        SHORTCUT_KEYS,
        (_, handler) => {
            if (!handler || !handler.keys) return;
            const shortcut = handler.keys.join("");

            if (shortcut == "/") {
                document.getElementById("fileSearchBox")?.focus();
            }
            if (shortcut == "a" && handler.ctrl) {
                dispatch(
                    setSelectedFileIndices([
                        ...Array(queried_files.length).keys(),
                    ]),
                );
            }
            if (shortcut == "enter") {
                if (last_selected_file !== null) {
                    dispatch(toggleSelectedFileIndex(last_selected_file));
                }
            }
            if (shortcut == "escape") {
                console.log("Clearing selected files");
                dispatch(clearSelectedFileIndices());
            }
            if (shortcut == "down") {
                if (last_selected_file !== null) {
                    if (
                        last_selected_file + column_number <
                        queried_files.length
                    ) {
                        if (handler.ctrl && handler.shift) {
                            dispatch(
                                appendSelectedFileIndicesBetween({
                                    start_index: last_selected_file,
                                    end_index:
                                        last_selected_file + column_number,
                                }),
                            );
                        } else if (handler.shift) {
                            dispatch(
                                appendSelectedFileIndex(
                                    last_selected_file + column_number,
                                ),
                            );
                        } else {
                            dispatch(clearSelectedFileIndices());
                            dispatch(
                                appendSelectedFileIndex(
                                    last_selected_file + column_number,
                                ),
                            );
                        }

                        document
                            .getElementById(
                                `file-card-${
                                    last_selected_file + column_number
                                }`,
                            )
                            ?.scrollIntoView({
                                behavior: "smooth",
                                block: "nearest",
                                inline: "nearest",
                            });
                    }
                }
            }
            if (shortcut == "up") {
                if (last_selected_file !== null) {
                    if (last_selected_file - column_number >= 0) {
                        if (handler.ctrl && handler.shift) {
                            dispatch(
                                appendSelectedFileIndicesBetween({
                                    start_index: last_selected_file,
                                    end_index:
                                        last_selected_file - column_number,
                                }),
                            );
                        } else if (handler.shift) {
                            dispatch(
                                appendSelectedFileIndex(
                                    last_selected_file - column_number,
                                ),
                            );
                        } else {
                            dispatch(clearSelectedFileIndices());
                            dispatch(
                                appendSelectedFileIndex(
                                    last_selected_file - column_number,
                                ),
                            );
                        }
                        document
                            .getElementById(
                                `file-card-${
                                    last_selected_file - column_number
                                }`,
                            )
                            ?.scrollIntoView({
                                behavior: "smooth",
                                block: "nearest",
                                inline: "nearest",
                            });
                    }
                }
            }
            if (shortcut == "right") {
                if (last_selected_file !== null) {
                    if (
                        (last_selected_file % column_number) + 1 <
                        column_number
                    ) {
                        if (handler.ctrl && handler.shift) {
                            dispatch(
                                appendSelectedFileIndicesBetween({
                                    start_index: last_selected_file,
                                    end_index: last_selected_file + 1,
                                }),
                            );
                        } else if (handler.shift) {
                            dispatch(
                                appendSelectedFileIndex(last_selected_file + 1),
                            );
                        } else {
                            dispatch(clearSelectedFileIndices());
                            dispatch(
                                appendSelectedFileIndex(last_selected_file + 1),
                            );
                        }
                    }
                }
            }
            if (shortcut == "left") {
                if (last_selected_file !== null) {
                    if ((last_selected_file % column_number) - 1 >= 0) {
                        if (handler.ctrl && handler.shift) {
                            dispatch(
                                appendSelectedFileIndicesBetween({
                                    start_index: last_selected_file,
                                    end_index: last_selected_file - 1,
                                }),
                            );
                        } else if (handler.shift) {
                            dispatch(
                                appendSelectedFileIndex(last_selected_file - 1),
                            );
                        } else {
                            dispatch(clearSelectedFileIndices());
                            dispatch(
                                appendSelectedFileIndex(last_selected_file - 1),
                            );
                        }
                    }
                }
            }
        },
        { preventDefault: true },
    );

    return (
        <div
            id="file-card-container"
            // @ts-expect-error - This is a valid ref, its from the useHotkeys hook and is designed to be used this way
            ref={ref}
            className="relative grid p-2 gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
            {queried_files.slice(0, visible_file_count).map((file, index) => {
                return <FileCard file={file} index={index} key={index} />;
            })}
        </div>
    );
}

export function FileCard(props: { file: GoogleFile | null; index: number }) {
    const dispatch = useAppDispatch();
    const file = props.file;
    const index = props.index;
    const file_name = file?.name;
    const queried_files = useAppSelector(getQueriedFiles);
    const selected_file_indices = useAppSelector(getSelectedFileIndices);
    const selected_files = selected_file_indices.map(
        (index) => queried_files[index],
    );
    const is_selected = useAppSelector(isFileIndexSelected(index));

    const last_selected_file =
        selected_file_indices.length > 0
            ? selected_file_indices[selected_file_indices.length - 1]
            : null;
    const thumbnail_link = file?.thumbnailLink;
    const icon_link = file?.iconLink;
    const file_tag_ids = useAppSelector(getFileTagsByID(file?.id || "")) || {
        tags: [],
    };

    const tag_applier = useAppSelector(getVisibleTagApplier);
    const applier_tags = useAppSelector(getVisibleTagApplierTags);

    return (
        <motion.div
            id={`file-card-${index}`}
            // Open the file in a new tab on double click
            onDoubleClick={(e) => {
                if (file === null) return;
                e.preventDefault();
                e.stopPropagation();
                window.open(file.webViewLink, "_blank")!.focus();
            }}
            onClick={(e) => {
                if (file === null) return;
                // If tags are to be applied on click, apply them
                if (tag_applier == "click" && applier_tags.length > 0) {
                    if (is_selected) {
                        dispatch(
                            addTagsToFiles({
                                file_ids: selected_files.map((file) => file.id),
                                tag_ids: applier_tags,
                            }),
                        );
                    } else {
                        dispatch(
                            addTagsToFiles({
                                file_ids: [file.id],
                                tag_ids: applier_tags,
                            }),
                        );
                    }
                } else {
                    if (e.ctrlKey) {
                        dispatch(toggleSelectedFileIndex(index));
                    } else if (e.shiftKey && last_selected_file !== null) {
                        // Add all files between the first selected file and this file
                        dispatch(
                            appendSelectedFileIndicesBetween({
                                start_index: last_selected_file,
                                end_index: index,
                            }),
                        );
                    } else {
                        // dispatch(clearSelectedFileIndices());
                        dispatch(toggleSelectedFileIndex(index));
                    }
                }
                e.preventDefault();
                e.stopPropagation();
            }}
            className={
                "bg-primary-100/90 rounded-2xl scroll-m-2" +
                " text-foreground outline-none shadow-medium transition-colors hover:bg-primary-300/45" +
                (last_selected_file === index
                    ? " ring-2 ring-primary-500"
                    : is_selected
                    ? " ring-2 ring-primary-300"
                    : "")
            }
        >
            <div className="relative w-full h-full items-center justify-center p-2 select-none">
                {file !== null ? (
                    <div className="size-6 absolute z-10 right-3 top-3">
                        <Image
                            draggable={false}
                            width={25}
                            src={icon_link}
                            className="object-cover w-full rounded-md shadow-lg"
                        ></Image>
                    </div>
                ) : (
                    <div></div>
                )}
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
                    {file !== null ? (
                        <Tooltip
                            content={file_name}
                            delay={250}
                            className="bg-zinc-900/85 shadow-md"
                            style={{
                                wordBreak: "break-word",
                            }}
                            classNames={{
                                base: "w-[150px]",
                                content: "break-words whitespace-break-spaces",
                            }}
                        >
                            <h3 className="truncate w-full h-[30px] bg-primary-600/15 rounded-b-md py-1 px-3 font-medium text-center">
                                {file_name}
                            </h3>
                        </Tooltip>
                    ) : (
                        <div className="w-[150px] h-[30px]"></div>
                    )}
                </Skeleton>
                <Spacer y={3} />
                <Skeleton
                    isLoaded={file !== null}
                    className="rounded-lg bg-primary-700/25 before:via-primary-700/30"
                >
                    <TagCard
                        tag_ids={file_tag_ids.tags}
                        file_index={index}
                        file_id={file?.id}
                    />
                </Skeleton>
            </div>
        </motion.div>
    );
}
