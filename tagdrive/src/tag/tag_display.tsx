import "../editor/Editor.css";
import {
    Autocomplete,
    AutocompleteItem,
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
import { getTagByID, getTags } from "./tags_slice.js";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import { getFilesLoaded, getSelectedFile, setSelectedFile } from "../drive/files_slice.js";

export const TAG_FILE_NAME = "TagOperatorOfficialTagList.json";


export function TagSearchBox() {
    return (
        <div className={"items-center justify-center"}>
            <Input
                variant="bordered"
                label="Search"
                placeholder="Enter your search here..."
                className="w-full"
                onValueChange={
                    (value) => {
                        console.log(value);
                    }
                }
            />
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
        <div className={`h-[30px] w-fit p-2 px-3 bg-${tag.color} rounded-full tag`}>
            <h6 className="text-xs h-fit drop-shadow">{tag.name}</h6>
        </div>
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

export function FileCard(props: {file: GoogleFile | null}) {
    const dispatch = useAppDispatch();
    const file = props.file;
    const file_name = file?.name;
    // TODO: Show in top right corner?
    const file_type = file?.mimeType;
    // TODO: use thumbnailLink instead of iconLink, google drive just
    // hates me sometimes and doesn't want to display thumbnails
    // const thumbnail_link = file?.thumbnailLink
    const thumbnail_link = file?.iconLink;
    const file_tag_ids = Math.random() > 0.5 ? ["TagFile0", "TagFile1"] : ["TagFile1", "TagFile2"];
    return (
            <Card
                isBlurred={false}
                isPressable
                isHoverable
                disableRipple
                id={`file-card-${file?.id || "null"}`}
                onClick={()=>{
                    if (file === null) return;
                    dispatch(setSelectedFile(file));
                    document.getElementById(`file-card-${file.id}`)?.focus();
                }}
                onFocusCapture={() => {
                    console.log("Focused", file?.name);
                }}
                onDoubleClick={(e)=>{
                    if (file === null) return;
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(file.webViewLink, '_blank')!.focus()
                }}
                className="border-none bg-zinc-900 rounded-2xl">
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
                        <TagCard tag_ids={file_tag_ids}/>
                    </Skeleton>
                </div>
            </Card>
    );
}



export function AddTagsCard() {

    const selectedFile = useAppSelector(getSelectedFile);
    const tags = useAppSelector(getTags);
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