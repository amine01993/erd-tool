"use client";
import {
    CSSProperties,
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
import { Icon } from "@iconify/react";
import ChevronRightIcon from "@iconify/icons-tabler/chevron-right";
import ChevronLeftIcon from "@iconify/icons-tabler/chevron-left";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
import EdgeInfo from "./EdgeInfo";
import { queryClient } from "@/app/helper/variables";
import Feedback from "../diagram/Feedback";
import "./style.css";

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});

export default memo(function Main() {
    const showToast = useAlertStore((state) => state.showToast);
    const offLine = useUserStore((state) => state.offLine);
    const isLeftPanelOpen = useUserStore((state) => state.isLeftPanelOpen);
    const isRightPanelOpen = useUserStore((state) => state.isRightPanelOpen);
    const isNavigationOpen = useUserStore((state) => state.isNavigationOpen);
    const isThemeMenuOpen = useUserStore((state) => state.isThemeMenuOpen);
    const isSettingsMenuOpen = useUserStore(
        (state) => state.isSettingsMenuOpen
    );
    const fullscreenMode = useUserStore((state) => state.fullscreenMode);

    const setOffLine = useUserStore((state) => state.setOffLine);
    const openLeftPanel = useUserStore((state) => state.openLeftPanel);
    const closeLeftPanel = useUserStore((state) => state.closeLeftPanel);
    const openRightPanel = useUserStore((state) => state.openRightPanel);
    const closeRightPanel = useUserStore((state) => state.closeRightPanel);
    const closeThemeMenu = useUserStore((state) => state.closeThemeMenu);
    const closeSettingsMenu = useUserStore((state) => state.closeSettingsMenu);
    const closeNavigation = useUserStore((state) => state.closeNavigation);
    const [entityPanelWidth, setEntityPanelWidth] = useState(300);
    const [smallScreenMode, setSmallScreenMode] = useState(false);

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

            if (
                isNavigationOpen &&
                !(event.target as HTMLElement).closest(".navigation-menu")
            ) {
                closeNavigation();
            }
        },
        [isThemeMenuOpen, isSettingsMenuOpen, isNavigationOpen]
    );

    const handleLeftPanelControl = useCallback(() => {
        if (isLeftPanelOpen) {
            closeLeftPanel();
        } else {
            openLeftPanel();
        }
    }, [isLeftPanelOpen]);
    const handleRightPanelControl = useCallback(() => {
        if (isRightPanelOpen) {
            closeRightPanel();
        } else {
            openRightPanel();
        }
    }, [isRightPanelOpen]);

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

    useEffect(() => {
        function handleResize() {
            if (mediaQuery.matches) {
                setSmallScreenMode(false);
            } else {
                setSmallScreenMode(true);
            }
        }

        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        handleResize();

        mediaQuery.addEventListener("change", handleResize);

        return () => {
            mediaQuery.removeEventListener("change", handleResize);
        };
    }, []);

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            <div
                id="main-wrapper"
                className={`h-screen w-full flex flex-col${
                    fullscreenMode ? " fullscreen" : ""
                }`}
                onClick={handleOutsideClick}
            >
                {!fullscreenMode && <Header />}
                <main
                    className=""
                    style={
                        {
                            "--entity-panel-width": `${entityPanelWidth}px`,
                        } as CSSProperties
                    }
                >
                    {!fullscreenMode && (
                        <div
                            className={`main-left-panel ${
                                isLeftPanelOpen ? "open" : ""
                            }`}
                        >
                            <div className="diagram-categories-container">
                                <DiagramCategories />
                            </div>
                            <div className="sidebar">
                                <Sidebar />
                            </div>
                            <button
                                className="collapse-button"
                                title={
                                    isLeftPanelOpen
                                        ? "Collapse Left Panel"
                                        : "Expand Left Panel"
                                }
                                onClick={handleLeftPanelControl}
                            >
                                {isLeftPanelOpen && (
                                    <Icon
                                        icon={ChevronLeftIcon}
                                        width={15}
                                        height={21}
                                    />
                                )}
                                {!isLeftPanelOpen && (
                                    <Icon
                                        icon={ChevronRightIcon}
                                        width={15}
                                        height={21}
                                    />
                                )}
                            </button>
                        </div>
                    )}

                    <ReactFlowProvider>
                        <ERD />
                    </ReactFlowProvider>

                    {!fullscreenMode && !smallScreenMode && (
                        <Resizable
                            defaultSize={{ width: 300 }}
                            minWidth={200}
                            maxWidth={500}
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
                            <div className="info-container p-3 pb-0 h-full">
                                <EntityInfo />
                                <EdgeInfo />
                            </div>
                        </Resizable>
                    )}
                    {!fullscreenMode && smallScreenMode && (
                        <div
                            className={`info-container p-3 pb-0 h-full main-right-panel ${
                                isRightPanelOpen ? "open" : ""
                            }`}
                        >
                            <EntityInfo />
                            <EdgeInfo />

                            <button
                                className="collapse-button"
                                title={
                                    isRightPanelOpen
                                        ? "Collapse Right Panel"
                                        : "Expand Right Panel"
                                }
                                onClick={handleRightPanelControl}
                            >
                                {isRightPanelOpen && (
                                    <Icon
                                        icon={ChevronRightIcon}
                                        width={15}
                                        height={21}
                                    />
                                )}
                                {!isRightPanelOpen && (
                                    <Icon
                                        icon={ChevronLeftIcon}
                                        width={15}
                                        height={21}
                                    />
                                )}
                            </button>
                        </div>
                    )}
                </main>
                <Authentication />
                <ConfirmationPermanentDelete />
                <ReadOnlyMode />
                <Feedback />
                <Toast />
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
    );
});
