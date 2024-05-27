import "../Editor.css";
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    Image,
    Input,
    Listbox,
    ListboxItem,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Selection,
    Skeleton,
    Spacer,
} from "@nextui-org/react";

import { useState } from "react";
import { GoogleFile } from "../drive/types";
import { Tag, TagID } from "./types";
import { tag_colors } from "../../tailwind.config.js";


const allowed_colors = tag_colors;


const temp_tags: {[id: TagID]: Tag} = {
    "0": {
        color: "amber-700",
        name: "Tag0",
        aliases: [],
        children: [],
        files: ["File0"]
    },
    "1":{
        color: "lime-700",
        name: "Second Tag",
        aliases: [],
        children: [],
        files: ["File0"]
    },
    "2":{
        color: "blue-800",
        name: "Tag2123123",
        aliases: [],
        children: [],
        files: ["File0"]
    }
}

function getTags() {
    return temp_tags;
}

function getTag(tag_id: TagID) {
    return temp_tags[tag_id];
}


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

function TagElement(props: {tag: Tag}) {
    const tag = props.tag;
    return (
        <div className={`h-[30px] w-fit p-2 bg-${tag.color} rounded-md tag`}>
            <h6 className="text-xs h-fit drop-shadow">{tag.name}</h6>
        </div>
    );
}

function TagCard(props: {tags: Tag[]}) {
    const tags = props.tags;
    return (
        <Card
            className="flex-row flex-wrap overflow-auto border-none bg-zinc-700 h-[90px] rounded-md p-2 gap-2">
            {
                tags.map((tag) => (
                    <TagElement tag={tag}/>
                ))
            }
        </Card>
    );
}

export function FileCard(props: {file: GoogleFile | null}) {
    const file = props.file;
    const file_name = file?.name;
    const file_type = file?.mimeType;
    const thumbnail_link = file?.thumbnailLink;
    const file_tags = Math.random() > 0.5 ? ["0", "1"] : ["1", "2"];
    return (
        <Card
            isBlurred={false}
            isPressable
            isHoverable
            disableRipple
            onClick={()=>{console.log("Clicked")}}
            onDoubleClick={(e)=>{
                e.preventDefault();
                e.stopPropagation();
                console.log("Double Clicked");
            }}
            className="border-none bg-zinc-900 rounded-2xl ">
            <div className="w-full h-full items-center justify-center p-2">
                <Skeleton
                    isLoaded={file !== null}
                    className="rounded-t-lg"
                >
                    <div className="overflow-hidden w-full h-[200px] place-content-center bg-zinc-700 rounded-t-md">
                        <Image
                            alt={file_name}
                            src={thumbnail_link}
                            loading="lazy"
                            disableSkeleton
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
                    <TagCard tags={file_tags.map((tag_id) => getTag(tag_id))}/>
                </Skeleton>
            </div>
        </Card>
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