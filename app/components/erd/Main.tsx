"use client";
import {
    memo,
    MouseEvent as RMouseEvent,
    useCallback,
    useEffect,
    useState,
} from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { NumberSize, Resizable } from "re-resizable";
import { Direction } from "re-resizable/lib/resizer";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient } from "@tanstack/react-query";
import useAlertStore from "@/app/store/alert";
import useUserStore from "@/app/store/user";
import Header from "./Header";
import Sidebar from "../diagram/Sidebar";
import ERD from "./ERD";
import EntityInfo from "./EntityInfo";
import Authentication from "../auth/Authentication";
import Toast from "./Toast";
import DiagramCategories from "../diagram/DiagramCategories";
import ConfirmationPermanentDelete from "../diagram/ConfirmationPermanentDelete";
import ReadOnlyMode from "../diagram/ReadOnlyMode";
import "./style.css";

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});

export default memo(function Main() {
    const showToast = useAlertStore((state) => state.showToast);
    const offLine = useUserStore((state) => state.offLine);
    const setOffLine = useUserStore((state) => state.setOffLine);
    const isThemeMenuOpen = useUserStore((state) => state.isThemeMenuOpen);
    const isSettingsMenuOpen = useUserStore(
        (state) => state.isSettingsMenuOpen
    );
    const closeThemeMenu = useUserStore((state) => state.closeThemeMenu);
    const closeSettingsMenu = useUserStore((state) => state.closeSettingsMenu);
    const [entityPanelWidth, setEntityPanelWidth] = useState(300);

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                gcTime: 1000 * 60 * 60 * 48,
            },
        },
    });

    const handleResize = useCallback(
        (
            _: MouseEvent | TouchEvent,
            direction: Direction,
            ref: HTMLElement,
            d: NumberSize
        ) => {
            setEntityPanelWidth(ref.clientWidth);
        },
        []
    );

    const handleOutsideClick = useCallback(
        (event: RMouseEvent<HTMLDivElement>) => {
            if (
                isThemeMenuOpen &&
                !(event.target as HTMLElement).closest(".theme-menu")
            ) {
                closeThemeMenu();
            }

            if (
                isSettingsMenuOpen &&
                !(event.target as HTMLElement).closest(".settings-menu")
            ) {
                closeSettingsMenu();
            }
        },
        [isThemeMenuOpen, isSettingsMenuOpen]
    );

    useEffect(() => {
        function onLineCb() {
            setOffLine(false);
            if (!offLine) {
                showToast("You are back online", "success");
            }
        }
        function offLineCb() {
            setOffLine(true);
            showToast("Currently offline", "error");
        }
        window.addEventListener("online", onLineCb);
        window.addEventListener("offline", offLineCb);

        return () => {
            window.removeEventListener("online", onLineCb);
            window.removeEventListener("offline", offLineCb);
        };
    }, [offLine]);

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            <div
                className="h-screen w-full flex flex-col"
                onClick={handleOutsideClick}
            >
                <Header />
                <main
                    className={`grid flex-1 h-[calc(100vh-57px)]`}
                    style={{
                        gridTemplateColumns: `50px 250px 1fr ${entityPanelWidth}px`,
                    }}
                >
                    <div className="bg-[#fefbfb] text-[#640D14] p-0.5 border-r border-[#640D14] h-[calc(100vh-57px)]">
                        <DiagramCategories />
                    </div>
                    <div className="sidebar">
                        <Sidebar />
                    </div>

                    <div className="h-[calc(100vh-57px)]">
                        <ReactFlowProvider>
                            <ERD />
                        </ReactFlowProvider>
                    </div>

                    <Resizable
                        defaultSize={{ width: 298 }}
                        minWidth={200}
                        maxWidth={500}
                        maxHeight={"calc(100vh - 57px)"}
                        enable={{
                            left: true,
                            right: false,
                            top: false,
                            bottom: false,
                        }}
                        grid={[10, 0]}
                        onResize={handleResize}
                        handleClasses={{ left: "resize-handle" }}
                    >
                        <div className="bg-[#fefbfb] text-black p-3 pb-0 border-l border-gray-400 h-full">
                            <EntityInfo />
                        </div>
                    </Resizable>
                </main>
                <Authentication />
                <ConfirmationPermanentDelete />
                <ReadOnlyMode />
                <Toast />
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
    );
});
