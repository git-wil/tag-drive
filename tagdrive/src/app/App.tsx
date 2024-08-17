import "./App.css";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { Router } from "./Router";
import { NextUIProvider } from "@nextui-org/react";

function App() {
    return (
        <Provider store={store}>
            <NextUIProvider>
                <Router />
            </NextUIProvider>
        </Provider>
    );
}

export default App;
