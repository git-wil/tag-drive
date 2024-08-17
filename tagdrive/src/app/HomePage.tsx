import "./App.css";
import { Button, Card, Select, SelectItem, Spacer } from "@nextui-org/react";
import {
    AUTH_URL,
    REDIRECT_URI,
    getAuth,
    logout,
    saveAuthByCode,
} from "../drive/auth";
import { GoogleDrive } from "../drive/google_types";
import { get_drive_list } from "../drive/google_helpers";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
    getDrives,
    isAuthorized,
    setAuthorized,
    setDrives,
} from "../store/slice_home";
import Logo from "../assets/tag_icon.svg";

function HomePage() {
    const dispatch = useAppDispatch();
    const authorized = useAppSelector(isAuthorized);
    const drives = useAppSelector(getDrives);

    const loadDrives = async () => {
        return get_drive_list().then(async (drives) => {
            const new_drives: GoogleDrive[] = [];
            new_drives.push({
                id: "",
                name: "My Drive",
                colorRgb: "hsl(var(--nextui-primary-900))",
            });
            for (const drive of drives.drives) {
                new_drives.push(drive);
            }
            console.log(new_drives);
            dispatch(setDrives(new_drives));
        });
    };

    const authorize_button = () => {
        if (!authorized) {
            // Popup the authorization window
            const result = authWindow();
            //
            result.then(
                async () => {
                    dispatch(setAuthorized(true));
                    loadDrives();
                },
                (error) => {
                    console.log("Error", error);
                },
            );
        } else {
            // Otherwise, log out
            logout();
            // Clear the drives and indicate that the user is no longer authorized
            dispatch(setDrives([]));
            dispatch(setAuthorized(false));
        }
    };

    // Check if the user is already authorized
    window.onload = async () => {
        if ((await getAuth()) !== null) {
            dispatch(setAuthorized(true));
            loadDrives();
        }
    };

    const authWindow = async () => {
        const new_window_width = 450;
        const new_window_height = 600;
        const new_window = window.open(
            AUTH_URL,
            "",
            `width=${new_window_width},height=${new_window_height}`,
        )!;
        new_window.moveTo(
            new_window.opener.screen.width / 2 - new_window_width / 2,
            new_window.opener.screen.height / 2 - new_window_height / 2,
        );
        new_window.focus();
        return new Promise((resolve) => {
            const check_window = setInterval(async () => {
                try {
                    // Check if the window has been redirected to the redirect uri
                    if (!new_window.crossOriginIsolated) {
                        if (new_window.location.href.includes(REDIRECT_URI)) {
                            // Get the authorization code from the url and save it
                            clearInterval(check_window);
                            console.log(
                                "Window location",
                                new_window.location.href,
                            );
                            const code = new_window.location.href
                                .split("code=")[1]
                                .split("&")[0]
                                .replace("%2f", "/")
                                .replace("%2F", "/");
                            new_window.close();
                            console.log("Got code", code);
                            await saveAuthByCode(code);
                            console.log("Authorized! Code:", code);
                            resolve("Finished");
                        }
                    }
                } catch (error) {
                    // Ignore any DOM errors, its just the google auth page not allowing
                    // the old window to access location.href
                }
                // Check every 200ms
            }, 200);
        });
    };

    return (
        <div className="w-screen h-dvh flex justify-center items-center p-8">
            <Card
                isBlurred
                shadow="sm"
                className=" border-none bg-background/60 dark:bg-default-100/50 w-2/3 md:w-1/2 lg:w-1/3 h-fit p-10"
            >
                <div className="flex flex-col gap-4 items-center justify-center">
                    <div className="w-full flex flex-row items-center justify-center">
                        <img
                            src={Logo}
                            alt="Tagger Logo"
                            className="w-12 h-12 mt-1"
                        />
                        <h1 className="ms-3 text-5xl font-bold">Tagger</h1>
                    </div>
                    <Spacer y={1} />
                    <div className="w-full">
                        <Button
                            color="danger"
                            className="w-full min-h-14 py-2 px-3"
                            onPress={authorize_button}
                        >
                            {authorized ? "Logout" : "Login"}
                        </Button>
                    </div>
                    <div className="w-full">
                        <Select
                            id="drive-select"
                            isDisabled={drives.length === 0}
                            label="Indexed Drive"
                            placeholder="Select a drive"
                            onChange={(e) => {
                                localStorage.setItem("drive", e.target.value);
                                window.location.href = "/editor";
                            }}
                            className="form-btn disabled"
                        >
                            {drives.map((drive) => (
                                <SelectItem
                                    key={drive.id}
                                    textValue={drive.name}
                                    startContent={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            // stroke="hsl(var(--nextui-primary-900))"
                                            className="size-4"
                                            style={{
                                                // Consider using the color from the drive
                                                // stroke: drive.colorRgb || "hsl(var(--nextui-primary-900))",
                                                stroke: "hsl(var(--nextui-primary-900))",
                                            }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                                            />
                                        </svg>
                                    }
                                >
                                    <div className="flex items-center">
                                        {drive.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className="flex w-full h-fit justify-end items-end">
                        <Button
                            className="w-fit h-fit py-2 px-3 -mb-5 text-sm"
                            color="secondary"
                            variant="light"
                            onPress={() => {
                                window.location.href = "/privacy";
                            }}
                        >
                            Read our Privacy Policy
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default HomePage;
