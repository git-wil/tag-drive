import "../editor/Editor.css";
import { Card, Skeleton, Image, Popover, PopoverTrigger, PopoverContent} from "@nextui-org/react";
import { getSelectedFile, getFilesLoaded } from "../drive/files_slice";
import { useAppSelector } from "../store/hooks";
import { MIME_TYPE_TO_NAME } from "../drive/google_helpers";
import { AddTagsCard, TagCard } from "../tag/tag_display";


export function Sidebar() {
    const selectedFile = useAppSelector(getSelectedFile);
    const filesLoaded = useAppSelector(getFilesLoaded);
    return (
        <Card
            className="space-y-5 p-4 w-full h-full rounded-tl-lg" radius="lg">
            <Skeleton className="rounded-lg" isLoaded={filesLoaded}>
                <div className="flex-1 w-full h-full rounded-lg bg-default-300">
                    {selectedFile !== null ? 
                        <Card
                        isPressable
                        onDoubleClick={() => {
                            window.open(selectedFile?.webViewLink, "_blank");
                        }}
                        className="w-full h-max rounded-lg">
                            {(() => {
                                    return (<Image
                                        src={selectedFile?.thumbnailLink}
                                            className="w-full h-max object-cover rounded-lg"
                                            aria-label="File Thumbnail"
                                            disableSkeleton
                                            referrerPolicy="no-referrer"
                                        ></Image>);
                            })()}
                        </Card> :
                        <div
                        className="w-full h-[200px] flex items-center justify-center">
                            <div className="justify-center">
                                <div className="text-default-500 font-medium">Select a file to</div>
                                <div className="break-before text-default-500 font-medium">see properties</div>
                            </div>
                            </div>}
                </div>
            </Skeleton>
            <Skeleton className="rounded-lg" isLoaded={filesLoaded}>
                {selectedFile !== null
                    ? <div className="w-full py-1 px-2 h-fit rounded-lg bg-default-300 text-lg font-medium">{selectedFile.name}</div>
                    : <div className="w-full py-1 px-2 h-[20px] rounded-lg bg-default-300"></div>}
            </Skeleton>
            
            <div className="space-y-5">
                <Skeleton className={`w-${filesLoaded ? "full" : "3/5"} rounded-lg`} isLoaded={filesLoaded}>
                    {selectedFile !== null
                        ? <div className="flex h-fit px-2 py-1 gap-3 w-full rounded-lg bg-default-300 items-center justify-center">
                            <div className="flex h-full w-2/5 text-default-700 text-xs sm:text-base md:text-base font-medium">Filetype:</div>
                            
                            <div className="flex gap-2 h-full w-3/5 items-center">
                                <div className="text-default-700 text-xs sm:text-base md:text-base font-semibold">{
                                    MIME_TYPE_TO_NAME[selectedFile.mimeType] || "Unknown"
                                }</div>
                                <Image
                                width={20}
                                src={selectedFile.iconLink}
                                className="w-4 rounded-md"
                                ></Image>
                            </div>
                        </div>
                        : <div className="h-3 w-3/5 rounded-lg bg-default-300"></div>}
                    
                </Skeleton>

                <Skeleton className={`w-${filesLoaded ? "full" : "4/5"} rounded-lg`} isLoaded={filesLoaded}>
                    {selectedFile !== null
                        ? <div className="h-fit px-2 pt-1 space-y-1 pb-2 gap-3 w-full rounded-lg bg-default-300 items-center justify-center">
                            <div className="h-full w-full text-default-700 text-xs sm:text-base md:text-base font-medium">Tags:</div>
                            <Popover
                            placement="left"
                            offset={20}
                            crossOffset={-5}
                            shouldCloseOnBlur
                            >
                                <PopoverTrigger>
                                    <Card 
                                    isPressable
                                    className="w-full h-full rounded-md bg-default-200 border-2 border-default-100">
                                        <TagCard tag_ids={Math.random() > 0.5 ? ["TagFile0", "TagFile1"] : ["TagFile1", "TagFile2"]}/>
                                    </Card>
                                </PopoverTrigger>
                                <PopoverContent
                                className="w-full h-full bg-default-300">
                                    <AddTagsCard/>
                                    {/* <div className="h-[200px] w-[200px] bg-default-300"></div> */}
                                </PopoverContent>
                            </Popover>
                        </div>
                        : <div className="h-3 w-4/5 rounded-lg bg-default-300"></div>}
                    
                </Skeleton>
            </div>
        </Card>
    );

}