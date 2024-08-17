import {
    Autocomplete,
    FreeSoloPopover,
    Input,
    Listbox,
    ListboxItem,
    ScrollShadow,
} from "@nextui-org/react";
import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import { Tag, TagID } from "../tag/tag_types";
import { getTagList } from "../store/slice_tags";

const demoTags: { [id: string]: Tag } = {
    T8dba83c23ae348ea9bacafea8a0f8218: {
        id: "T8dba83c23ae348ea9bacafea8a0f8218",
        name: "Test Tag 0 (UPDATED!)",
        color: "purple-800",
        icon: "",
        aliases: ["updated!"],
        children: [],
        parent: "",
    },
    T6d1eaa147f4b47eea95492370c2e1647: {
        id: "T6d1eaa147f4b47eea95492370c2e1647",
        name: "Test Tag 1 (UPDATED!)",
        color: "purple-800",
        icon: "",
        aliases: ["updated!"],
        children: [],
        parent: "",
    },
    T89af556ac7204ebab85625c94dd89bfb: {
        id: "T89af556ac7204ebab85625c94dd89bfb",
        name: "Test Tag 11 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    T823c5205e6b64e99bad94c83473404c6: {
        id: "T823c5205e6b64e99bad94c83473404c6",
        name: "Test Tag 12 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    T273e0b7a345c4b06804057e1b03a2ada: {
        id: "T273e0b7a345c4b06804057e1b03a2ada",
        name: "Test Tag 13 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    T11ed0681d0c8423397adf335c91cac20: {
        id: "T11ed0681d0c8423397adf335c91cac20",
        name: "Test Tag 14 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    Te07197b90bda4493a883e2fb9637f1b6: {
        id: "Te07197b90bda4493a883e2fb9637f1b6",
        name: "Test Tag 15 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    T122a69a88a6548d3aac66a84c921ecd0: {
        id: "T122a69a88a6548d3aac66a84c921ecd0",
        name: "Test Tag 16 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    Ta5e181f13b764dada93578a51c762197: {
        id: "Ta5e181f13b764dada93578a51c762197",
        name: "Test Tag 17 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    T330fa1d747bb422eb92b6b520c388aaa: {
        id: "T330fa1d747bb422eb92b6b520c388aaa",
        name: "Test Tag 18 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    Td0873d673ce84f159eb988f071902bce: {
        id: "Td0873d673ce84f159eb988f071902bce",
        name: "Test Tag 19 NEW",
        color: "red-800",
        icon: "",
        aliases: [],
        children: [],
        parent: "",
    },
    T14fa4cfe57c34689aca9ee379480c3fc: {
        id: "T14fa4cfe57c34689aca9ee379480c3fc",
        name: "Test Tag 0 NEWEST",
        color: "red-800",
        icon: "",
        aliases: ["newest"],
        children: [],
        parent: "",
    },
    T23d39e4873ec4fd79484637ad18deae1: {
        id: "T23d39e4873ec4fd79484637ad18deae1",
        name: "Test Tag 1 NEWEST",
        color: "red-800",
        icon: "",
        aliases: ["newest"],
        children: [],
        parent: "",
    },
    T61d5613ab26644c89d6d881ed2e6c101: {
        id: "T61d5613ab26644c89d6d881ed2e6c101",
        name: "Test Tag 0 HERE",
        color: "red-800",
        icon: "",
        aliases: ["newest again"],
        children: [],
        parent: "",
    },
    Td2f9817f526b49259b1590a1b0a1cde0: {
        id: "Td2f9817f526b49259b1590a1b0a1cde0",
        name: "Test Tag 1 HERE",
        color: "red-800",
        icon: "",
        aliases: ["newest again"],
        children: [],
        parent: "",
    },
};

export function FileSearchBox() {
    const [isOpen, setOpen] = useState(true);
    const [typedTags, setTypedTags] = useState<TagID[]>([]);
    const tags = demoTags; //useAppSelector(getTagList);
    const [visibleTags, setVisibleTags] = useState<Tag[]>(Object.values(tags));
    const [value, setValue] = useState("");
    const popoverContent = isOpen ? (
        <FreeSoloPopover>
            <ScrollShadow>
                <Listbox aria-label="Tags">
                    {visibleTags
                        .filter((tag) => !typedTags.includes(tag.id))
                        .map((tag) => (
                            <ListboxItem key={tag.id}>{tag.name}</ListboxItem>
                        ))}
                </Listbox>
            </ScrollShadow>
        </FreeSoloPopover>
    ) : (
        <p>😭 You have no tags 😭</p>
    );

    return (
        <div className={"items-center justify-center"}>
            <Input
                variant="bordered"
                label={<div className="my-1.5">Search</div>}
                placeholder={
                    typedTags.length == 0 ? "Type a tag or file name..." : ""
                }
                isClearable
                classNames={{
                    base: "h-full",
                    mainWrapper: "h-full",
                    inputWrapper: "h-[65px]",
                    input: "mb-0.5 text-md",
                }}
                labelPlacement="inside"
                startContent={
                    <div className="flex gap-2">
                        {typedTags.map((tag_id) => (
                            <p key={tag_id}>{tags[tag_id].name}</p>
                        ))}
                    </div>
                }
                /* onFocus={() => {
                    console.log("Hidden False");
                    setOpen(true);
                }}
                onBlur={() => {
                    console.log("Hidden true");
                    setOpen(false);
                }} */
                value={value}
                onValueChange={(value) => {
                    setValue(value);
                    console.log("Value: ", value);
                    console.log("Typed Tags: ", typedTags);

                    setVisibleTags(
                        Object.keys(tags)
                            .filter((tag_id) =>
                                tags[tag_id].name.includes(value),
                            )
                            .map((tag_id) => tags[tag_id]),
                    );

                    if (
                        Object.values(tags)
                            .map((tag) => tag.name)
                            .includes(value)
                    ) {
                        setTypedTags([
                            ...typedTags,
                            Object.values(tags).find(
                                (tag) => tag.name === value,
                            )!.id,
                        ]);
                        setValue("");
                    }
                }}
                onKeyDown={(e) => {
                    if (
                        e.key === "Backspace" &&
                        typedTags.length > 0 &&
                        value === ""
                    ) {
                        //
                    }
                }}
            />
            {popoverContent}
            {/* <Card id={popover_id} hidden={hidden} className="absolute w-full z-50 bg-transparent shadow-none    " >
                <div className="mx-2 my-0.5 z-50 min-w-[300px] w-1/3 bg-default-200 rounded-2xl px-4 py-2 shadow-xl">Test</div>
            </Card> */}
        </div>
    );
}
