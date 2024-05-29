import { useState } from "react";
/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console


// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

// Authorization scopes required by the API; multiple scopes can be`
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly";

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

/**
 * Callback after api.js is loaded.
 */
export function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
        redirect_uri: "http://localhost:3000",
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
export function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: "", // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        // TODO: load authorization menu
    }
}

async function onAuth() {
    // TODO: Run on authorization
    // Get list of user's drives
    let response;
    try {
        response = await gapi.client.drives.list({
            pageSize: 100,
        });
    } catch (err) {
        // TODO: show bad stuff
        console.log(err);
        return;
    }
    if (!response || !response.drives) {
        // Todo: Show bad stuff
        return;
    }
    // Create list of drives
    const drive_names = response.drives.forEach((drive: any) => drive.name);
    const drive_ids = response.drives.forEach((drive: any) => drive.id);
}

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick() {
    tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        await onAuth();
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: "" });
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken("");
        // TODO: Return to main tag drive page with no login
    }
}

/**
 * Print metadata for first 10 files.
 */
async function listFiles() {
    let response;
    let files = [];
    let pageToken;
    // for (let id of ids.split("\n")) {
    //     try {
    //         response = await gapi.client.drive.files.get({
    //             fileId: id,
    //             supportsAllDrives: true,

    //         });
    //     } catch (err) {
    //         console.log(err);
    //         // document.getElementById("content").innerText = err.message;
    //         // return;
    //     }
    //     // console.log(response);
    //     files.push(response.result.name)
    // }
    while (true) {
        // Get 1000 files from the selected drive
        try {
            response = await gapi.client.drive.files.list({
                corpora: "user",
                pageSize: 1000,
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
                order_by: "name",
                // driveId: '',
                // q: "(mimeType = 'application/vnd.google-apps.document') or (mimeType = 'application/vnd.google-apps.spreadsheet')",
                q: "((mimeType = 'application/vnd.google-apps.document') or (mimeType = 'application/vnd.google-apps.spreadsheet') or (mimeType = 'application/vnd.google-apps.presentation') or (mimeType = 'application/msword') or (mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') or (mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') or (mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation') or (mimeType = 'application/pdf') or (mimeType = 'application/rtf') or (mimeType = 'text/csv') or (mimeType = 'audio/mpeg') or (mimeType = 'audio/aac') or (mimeType = 'audio/wav') or (mimeType = 'image/png') or (mimeType = 'image/jpeg') or (mimeType = 'image/bmp') or (mimeType = 'image/heif') or (mimeType = 'image/gif') or (mimeType = 'video/x-msvideo') or (mimeType = 'video/quicktime') or (mimeType = 'video/x-matroska'))",
                pageToken: pageToken,
            });
        } catch (err) {
            document.getElementById("content")!.innerText = err.message;
            return;
        }
        //console.log(response)
        // Update the list of files
        if (!files) {
            files = response.result.files;
        } else {
            files.push(...response.result.files);
        }
        // If there is a next page token
        if (response.result.nextPageToken) {
            //console.log(response.result.nextPageToken)
            pageToken = response.result.nextPageToken;
        } else {
            break;
        }
    }
    if (files.length == 0) {
        document.getElementById("content")!.innerText = "No files found.";
        return;
    }
    // Flatten to string to display
    const output = files.reduce(
        (str, file) => `${str}${file.name} (${file.id})\n`,
        "Files:\n"
    );
    document.getElementById("content")!.innerText = output;
}
