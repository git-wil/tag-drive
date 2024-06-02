import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import EditorNew from "./EditorNew.tsx";
import { store } from "../store/store.ts";
import { Provider } from "react-redux";
import "../index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <NextUIProvider>
                <EditorNew />
            </NextUIProvider>
        </Provider>
    </React.StrictMode>
);
