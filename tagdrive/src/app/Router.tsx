import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Privacy } from "../privacy/Privacy";
import HomePage from "./HomePage";
import EditorNew from "../editor/EditorNew";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/privacy",
        element: <Privacy />,
    },

    {
        path: "/editor",
        element: <EditorNew />,
    },
]);

export function Router() {
    return <RouterProvider router={router} />;
}
