// import { useAppDispatch } from "../store/hooks";
import { CLIENT_ID, CLIENT_SECRET } from "./credentials";
// import { setAuthorized } from "./files_slice";

const SCOPE = "https://www.googleapis.com/auth/drive";
export const REDIRECT_URI = "http://localhost:3000"; // "https://tag-drive.web.app";
// Create the authorization url for Google OAuth2
export const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?
client_id=${encodeURIComponent(CLIENT_ID)}&
redirect_uri=${encodeURIComponent(REDIRECT_URI)}&
response_type=code&
scope=${encodeURIComponent(SCOPE)}&
include_granted_scopes=true&
prompt=consent&
access_type=offline`.replace(/\s+/g, "");

export async function saveAuthByCode(auth_code: string) {
    // Get the access and refresh tokens from the Google OAuth2 API
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: JSON.stringify({
            code: auth_code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
        }),
    });
    const token = await response.json();
    console.log("Token response", token);
    saveToken(token.access_token);
    saveRefreshToken(token.refresh_token);
    console.log("Token saved!", getToken());
}

function saveToken(token: string) {
    localStorage.setItem("token", token);
    console.log("Saving token", token);
}

function getToken(): string | null {
    return localStorage.getItem("token");
}


function saveRefreshToken(refresh_token: string) {
    // TODO: Implement refresh token saving through Firebase
    localStorage.setItem("refresh_token", refresh_token);
    console.log("Saving refresh token", refresh_token);
}

function getRefreshToken(): string | null {
    // TODO: Implement refresh token retrieval through Firebase
    return localStorage.getItem("refresh_token");
}

async function updateToken(): Promise<string | null> {
    const refresh_token = getRefreshToken();
    // If the refresh token doesn't exist, return null
    if (!refresh_token) {
        return null;
    }
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refresh_token,
            grant_type: "refresh_token",
        }),
    });
    const token = await response.json();
    saveToken(token.access_token);
    return token.access_token;
}

// General authorization function that accounts for refresh tokens
export async function getAuth(): Promise<string | null> {
    const token = getToken();
    if (token) {
        //Check if token is valid using the Google Drive API
        try {
            const response = await fetch("https://oauth2.googleapis.com/tokeninfo?access_token=" + token, {
                method: "GET",
            });
            if (response.status === 200) {
                return token;
            }
        } catch (error) {
            // If the token is invalid, try updating it using the refresh token
        }
        return await updateToken();
    }
    return null;
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    console.log("Deauthorized");
}