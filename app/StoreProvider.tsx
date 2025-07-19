"use client";
import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./lib/store";
import { DiagramData, initDiagrams } from "./store/diagram";

export default function StoreProvider({
    diagrams,
    children,
}: {
    diagrams?: DiagramData[];
    children: ReactNode;
}) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore();
        if(diagrams) {
            // Initialize diagrams if provided
            storeRef.current.dispatch(initDiagrams(diagrams));
        }
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}
