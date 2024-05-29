import { useState } from "react";
import "./App.css";
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    CardBody,
    Select,
    SelectItem,
    Slider,
    Image,
    Spacer,
} from "@nextui-org/react";
import { authorize, getAuth } from "../drive/auth";
import { GoogleDrive } from "../drive/google_types";
import { get_drive_list } from "../drive/google_helpers";

export let setAuthorized: CallableFunction | null = null;
let pre_authorized = await getAuth() !== null; 



function App() {
    const [authorized, local_setAuthorized] = useState(false);
    setAuthorized = local_setAuthorized;
    const [drives, setDrives] = useState<GoogleDrive[]>([]);

    if (authorized || pre_authorized) {
        // TODO: Update drives on page load if pre-authorized
        // Only run once after authorization
        setAuthorized(false);
        pre_authorized = false;
        get_drive_list().then(async (data) => {
            const new_drives: GoogleDrive[] = [];
            for (const drive of data.drives) {
                new_drives.push(drive);
            }
            console.log(new_drives);
            setDrives(new_drives);
        }); 
    }
    
    return (
        <>  
            <Spacer y={
                // TODO: Center the card on the screen dynamically, this is bad
                `${window.innerHeight/4}px`
                } />
            <div className="flex align-middle justify-center">
                <Card
                    isBlurred
                    shadow="sm"
                    className="border-none bg-background/60 dark:bg-default-100/50 max-w-[1000px] w-[500px] p-10"
                >
                    <CardBody>
                        <div className="grid grid-cols-10 md:grid-cols-10 gap-6 md:gap-4 items-center justify-center">
                            <h1 className="col-span-10 text-5xl font-bold text-center">Tag Operator</h1>
                            <Spacer y={2} />
                            <div className="relative col-span-10">
                                <Button
                                    color="danger"
                                    className="w-full min-h-14 py-2 px-3"
                                    onPress={authorize}
                                >
                                    Authenticate
                                </Button>
                            </div>
                            <div className="relative col-span-10">
                                <Select
                                    id="drive-select"
                                    isDisabled={drives.length === 0}
                                    label="Indexed Drive"
                                    placeholder="Select a drive"
                                    onSelectionChange={(e) => {
                                        console.log(e);
                                    }}
                                    className="form-btn disabled"
                                >
                                    {drives.map((drive) => (
                                        <SelectItem
                                            key={drive.id}
                                            value={drive.id}
                                        >
                                            {drive.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                            {/* <div className="relative col-span-6 md:col-span-4">
                                <Image
                                    alt="Album cover"
                                    className="object-cover"
                                    height={200}
                                    shadow="md"
                                    src="https://nextui.org/images/album-cover.png"
                                    width="100%"
                                />
                            </div>

                            <div className="flex flex-col col-span-6 md:col-span-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-0">
                                        <h3 className="font-semibold text-foreground/90">
                                            Daily Mix
                                        </h3>
                                        <p className="text-small text-foreground/80">
                                            12 Tracks
                                        </p>
                                        <h1 className="text-large font-medium mt-2">
                                            Frontend Radio
                                        </h1>
                                    </div>
                                    <Button
                                        isIconOnly
                                        className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                                        radius="full"
                                        variant="light"
                                        onPress={() => setLiked((v) => !v)}
                                    >
                                        Heart
                                    </Button>
                                </div>

                                <div className="flex flex-col mt-3 gap-1">
                                    <Slider
                                        aria-label="Music progress"
                                        classNames={{
                                            track: "bg-default-500/30",
                                            thumb: "w-2 h-2 after:w-2 after:h-2 after:bg-foreground",
                                        }}
                                        color="foreground"
                                        defaultValue={33}
                                        size="sm"
                                    />
                                    <div className="flex justify-between">
                                        <p className="text-small">1:23</p>
                                        <p className="text-small text-foreground/50">
                                            4:32
                                        </p>
                                    </div>
                                </div>

                                <div className="flex w-full items-center justify-center">
                                    <Button
                                        isIconOnly
                                        className="data-[hover]:bg-foreground/10"
                                        radius="full"
                                        variant="light"
                                    >
                                        Repeat
                                    </Button>
                                    <Button
                                        isIconOnly
                                        className="data-[hover]:bg-foreground/10"
                                        radius="full"
                                        variant="light"
                                    >
                                        Prev
                                    </Button>
                                    <Button
                                        isIconOnly
                                        className="w-auto h-auto data-[hover]:bg-foreground/10"
                                        radius="full"
                                        variant="light"
                                    >
                                        Pause
                                    </Button>
                                    <Button
                                        isIconOnly
                                        className="data-[hover]:bg-foreground/10"
                                        radius="full"
                                        variant="light"
                                    >
                                        Next
                                    </Button>
                                    <Button
                                        isIconOnly
                                        className="data-[hover]:bg-foreground/10"
                                        radius="full"
                                        variant="light"
                                    >
                                        Shuffle
                                    </Button>
                                </div>
                            </div> */}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

export default App;
