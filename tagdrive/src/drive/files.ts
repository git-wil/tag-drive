import { ListOutput, ListQuery } from "./types";

export default async function list(params: ListQuery): Promise<ListOutput> {
    const endpoint = "https://www.googleapis.com/drive/v3/files";
    const url = new URL(endpoint);
    const headers = new Headers();
    //headers.append("Authorization", `Bearer ${params.token}`);
    const response = await fetch(url.toString(), {
        method: "GET",
        body: JSON.stringify(params),
        headers,
    });
    return response.json();
}
