import { Button, Card } from "@nextui-org/react";
import { FileSearchBox } from "./TagSelect";

export function Privacy() {
    return (
        <div className="h-dvh w-screen flex justify-center items-center p-10">
            <Card
                isBlurred
                className="h-fit w-full sm:w-3/4 lg:w-1/2 p-10 flex"
            >
                <h1 className=" self-center text-3xl font-bold pb-5">
                    Privacy Policy
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-3 indent-5">
                    At TagDrive, one of our main priorities is the privacy of
                    our visitors. This Privacy Policy document contains types of
                    information that is collected and recorded by TagDrive and
                    how we use it.
                </p>
                <p className="text-base sm:text-lg md:text-xl mb-3 indent-5">
                    This project uses Google OAuth to authenticate users and
                    access their Google Drive™ files. Google Drive is a
                    trademark of Google Inc. Use of this trademark is subject to
                    Google Permissions.
                </p>
                <p className="text-base sm:text-lg md:text-xl mb-3 indent-5">
                    This project does not collect any personal information. When
                    you authenticate with Google, we only store your
                    personalized access token in your browser's local storage.
                    We use your authentication to access your Google Drive files
                    and display them in the app. We also store your tag data in
                    the selected Google Drive as a Google Doc.
                </p>
                <p className="text-base sm:text-lg md:text-xl mb-3 indent-5">
                    If you have additional questions or require more information
                    about our Privacy Policy, do not hesitate to contact the
                    <a href="mailto:wil@gmx.com" className=" text-primary">
                        {" "}
                        developers of this app
                    </a>
                    .
                </p>
                <div className="flex w-full h-fit justify-end items-end">
                    <Button
                        className="w-fit h-fit py-2 px-3 -mb-5 text-sm"
                        color="primary"
                        variant="light"
                        onPress={() => {
                            window.location.href = "/";
                        }}
                        startContent={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="hsl(var(--nextui-primary))"
                                className="size-4 -me-1"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                />
                            </svg>
                        }
                    >
                        Return to Homepage
                    </Button>
                </div>
                <br />
                <br />
                <br />
                <FileSearchBox></FileSearchBox>
            </Card>
        </div>
    );
}
