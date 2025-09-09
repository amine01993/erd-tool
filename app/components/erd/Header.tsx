import Image from "next/image";
import { memo, useCallback, useEffect } from "react";
import { Hub } from "@aws-amplify/core";
import { Icon } from "@iconify/react";
import cc from "classcat";
import ArrowBackUpIcon from "@iconify/icons-tabler/arrow-back-up";
import ArrowForwardUpIcon from "@iconify/icons-tabler/arrow-forward-up";
import LayersSubtractIcon from "@iconify/icons-tabler/layers-subtract";
import TrashIcon from "@iconify/icons-tabler/trash";
import DatabaseExportIcon from "@iconify/icons-tabler/database-export";
import CloudCheckIcon from "@iconify/icons-tabler/cloud-check";
import CloudIcon from "@iconify/icons-tabler/cloud";
import CirclePlusIcon from "@iconify/icons-tabler/circle-plus";
import CloudXIcon from "@iconify/icons-tabler/cloud-x";
import RefreshIcon from "@iconify/icons-tabler/refresh";
import TrashOffIcon from "@iconify/icons-tabler/trash-off";
import { useQueryClient } from "@tanstack/react-query";
import useDiagramStore, {
    disableRedoSelector,
    disableUndoSelector,
} from "@/app/store/diagram";
import useUserStore, { isAnyModalOrMenuOpenSelector } from "@/app/store/user";
import Theme from "../widgets/Theme";
import Settings from "../widgets/Settings";
import useDeleteDiagram from "@/app/hooks/DiagramDelete";
import useRecoverDiagram from "@/app/hooks/DiagramRecover";
import useAddDiagram from "@/app/hooks/DiagramAdd";
import Tooltip from "./Tooltip";
import AiSuggestions from "../widgets/AiSuggestions";

const Header = () => {
    const offLine = useUserStore((state) => state.offLine);
    const isAnyModalOrMenuOpen = useUserStore(isAnyModalOrMenuOpenSelector);
    const setFetchingSession = useUserStore(
        (state) => state.setFetchingSession
    );
    const retrieveAuthData = useUserStore((state) => state.retrieveAuthData);
    const emptyAuthData = useUserStore((state) => state.emptyAuthData);
    const openConfirmModal = useUserStore((state) => state.openConfirmModal);
    const openAiPrompt = useUserStore((state) => state.openAiPrompt);
    const openExportModal = useUserStore((state) => state.openExportModal);
    const mutationAdd = useAddDiagram();
    const mutationDelete = useDeleteDiagram();
    const mutationRecover = useRecoverDiagram();
    const queryClient = useQueryClient();

    const category = useDiagramStore((state) => state.category);
    const loading = useDiagramStore((state) => state.loading);
    const syncing = useDiagramStore((state) => state.syncing);
    const selectedDiagram = useDiagramStore((state) => state.selectedDiagram);
    const disableUndo = useDiagramStore(disableUndoSelector);
    const disableRedo = useDiagramStore(disableRedoSelector);
    const refreshing = useDiagramStore((state) => state.refreshing);
    const setCategory = useDiagramStore((state) => state.setCategory);
    const startRefreshing = useDiagramStore((state) => state.startRefreshing);
    const emptyDiagrams = useDiagramStore((state) => state.emptyDiagrams);
    const createDiagram = useDiagramStore((state) => state.createDiagram);
    const duplicateDiagram = useDiagramStore((state) => state.duplicateDiagram);
    const deleteDiagram = useDiagramStore((state) => state.deleteDiagram);
    const recoverDiagram = useDiagramStore((state) => state.recoverDiagram);
    const undoAction = useDiagramStore((state) => state.undoAction);
    const redoAction = useDiagramStore((state) => state.redoAction);

    const handleUndo = useCallback(() => {
        undoAction();
    }, [undoAction]);

    const handleRedo = useCallback(() => {
        redoAction();
    }, [redoAction]);

    const handleDiagramsRefresh = useCallback(() => {
        if (offLine || refreshing) return;
        startRefreshing();
        emptyDiagrams();
        queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    }, [offLine, refreshing, emptyDiagrams]);

    const handleNewDiagram = useCallback(() => {
        createDiagram(mutationAdd);
    }, [createDiagram]);

    const handleDuplicateDiagram = useCallback(() => {
        duplicateDiagram(mutationAdd);
    }, [duplicateDiagram]);

    const handleDeleteDiagram = useCallback(() => {
        if (category === "deleted") {
            openConfirmModal();
        } else {
            deleteDiagram(mutationDelete, mutationAdd);
        }
    }, [deleteDiagram, openConfirmModal, category]);

    const handleRecoverDiagram = useCallback(() => {
        recoverDiagram(mutationRecover);
    }, [recoverDiagram]);

    const handleOpenAiPrompt = useCallback(() => {
        if (offLine) return;
        openAiPrompt();
    }, [offLine]);

    const handleExportDiagram = useCallback(() => {
        openExportModal();
    }, []);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!isAnyModalOrMenuOpen) {
                if (e.ctrlKey && !e.shiftKey && e.key?.toLowerCase() === "z") {
                    e.preventDefault();
                    handleUndo();
                } else if (
                    e.ctrlKey &&
                    e.shiftKey &&
                    e.key.toLowerCase() === "z"
                ) {
                    e.preventDefault();
                    handleRedo();
                } else if (e.ctrlKey && e.key?.toLowerCase() === "r") {
                    e.preventDefault();
                    handleDiagramsRefresh();
                } else if (e.ctrlKey && e.key?.toLowerCase() === "n") {
                    e.preventDefault();
                    handleNewDiagram();
                } else if (e.ctrlKey && e.key?.toLowerCase() === "d") {
                    e.preventDefault();
                    handleDuplicateDiagram();
                } else if (e.ctrlKey && e.key?.toLowerCase() === "i" && !offLine) {
                    e.preventDefault();
                    handleOpenAiPrompt();
                } else if (e.key?.toLowerCase() === "delete") {
                    e.preventDefault();
                    handleDeleteDiagram();
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        isAnyModalOrMenuOpen,
        handleUndo,
        handleRedo,
        handleDiagramsRefresh,
        handleNewDiagram,
        handleDuplicateDiagram,
        handleOpenAiPrompt,
        handleDeleteDiagram,
    ]);

    useEffect(() => {
        function initAuthData() {
            retrieveAuthData()
                .then(() => {
                    setCategory("all");
                    emptyDiagrams();
                    queryClient.invalidateQueries({ queryKey: ["diagrams"] });
                })
                .catch((error) => {
                    console.error("Error retrieving auth data:", error);
                })
                .finally(() => {
                    setFetchingSession(false);
                });
        }

        const unsubscribe = Hub.listen("auth", async ({ payload }) => {
            console.log("Hub.auth", payload);
            switch (payload.event) {
                case "signedIn":
                    console.log("user have been signedIn successfully.");
                    emptyAuthData();
                    initAuthData();
                    break;
                case "signedOut":
                    console.log("user have been signedOut successfully.");
                    emptyAuthData();
                    initAuthData();
                    break;
                case "tokenRefresh":
                    console.log("auth tokens have been refreshed.");
                    break;
                case "tokenRefresh_failure":
                    console.log("failure while refreshing auth tokens.");
                    break;
            }
        });

        initAuthData();

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <header className="flex items-center justify-between px-3 py-2 bg-[#fefbfb] text-[#640D14] border-b border-[#640D14]">
            <div className="flex items-center gap-1">
                <Image
                    className="mr-1"
                    src="/logo-light.svg"
                    alt="Entity Relational Diagram Tool logo"
                    width={40}
                    height={35}
                    priority
                />

                {category === "all" && (
                    <>
                        <button
                            aria-label="Undo last action"
                            className="header-btn relative"
                            id="undo-button"
                            onClick={handleUndo}
                            disabled={disableUndo}
                        >
                            <Icon icon={ArrowBackUpIcon} fontSize={21} />
                            <Tooltip
                                message="Undo (Ctrl + Z)"
                                selector="#undo-button"
                                position="bottom"
                            />
                        </button>

                        <button
                            aria-label="Redo"
                            className="header-btn relative"
                            id="redo-button"
                            onClick={handleRedo}
                            disabled={disableRedo}
                        >
                            <Icon icon={ArrowForwardUpIcon} fontSize={21} />
                            <Tooltip
                                message="Redo (Ctrl + Shift + Z)"
                                selector="#redo-button"
                                position="bottom"
                            />
                        </button>
                    </>
                )}

                <button
                    aria-label="Refresh diagrams' list"
                    className={cc([
                        "header-btn relative",
                        { "animate-spin": refreshing },
                    ])}
                    id="refresh-button"
                    onClick={handleDiagramsRefresh}
                    disabled={offLine || refreshing}
                >
                    <Icon icon={RefreshIcon} fontSize={21} />
                    <Tooltip
                        message="Refresh (Ctrl + R)"
                        selector="#refresh-button"
                        position="bottom"
                    />
                </button>

                {category === "all" && (
                    <>
                        <button
                            aria-label="Create new diagram"
                            className="header-btn relative"
                            id="new-diagram-button"
                            onClick={handleNewDiagram}
                        >
                            <Icon icon={CirclePlusIcon} fontSize={21} />
                            <Tooltip
                                message="Create (Ctrl + N)"
                                selector="#new-diagram-button"
                                position="bottom"
                            />
                        </button>
                        <button
                            aria-label="Duplicate selected diagram"
                            className="header-btn relative"
                            id="duplicate-diagram-button"
                            onClick={handleDuplicateDiagram}
                            disabled={selectedDiagram === "" || loading}
                        >
                            <Icon icon={LayersSubtractIcon} fontSize={21} />
                            <Tooltip
                                message="Duplicate (Ctrl + D)"
                                selector="#duplicate-diagram-button"
                                position="bottom"
                            />
                        </button>
                    </>
                )}

                <button
                    aria-label="Delete selected diagram"
                    className="header-btn relative"
                    id="delete-diagram-button"
                    onClick={handleDeleteDiagram}
                    disabled={selectedDiagram === "" || loading}
                >
                    <Icon icon={TrashIcon} fontSize={21} />
                    <Tooltip
                        message={
                            category === "all"
                                ? "Delete (Del)"
                                : "Delete Permanently (Del)"
                        }
                        selector="#delete-diagram-button"
                        position="bottom"
                    />
                </button>

                {category === "deleted" && (
                    <button
                        aria-label="Recover selected diagram"
                        className="header-btn relative"
                        id="recover-diagram-button"
                        onClick={handleRecoverDiagram}
                        disabled={selectedDiagram === "" || loading}
                    >
                        <Icon icon={TrashOffIcon} fontSize={21} />
                        <Tooltip
                            message="Recover (Ctrl + Shift + R)"
                            selector="#recover-diagram-button"
                            position="bottom"
                        />
                    </button>
                )}

                {category === "all" && (
                    <button
                        className="flex items-center gap-2 header-btn relative"
                        id="export-diagram-button"
                        onClick={handleExportDiagram}
                        disabled={selectedDiagram === "" || loading}
                    >
                        <Icon icon={DatabaseExportIcon} fontSize={21} />
                        Export
                        <Tooltip
                            message="Export (Ctrl + E)"
                            selector="#export-diagram-button"
                            position="bottom"
                        />
                    </button>
                )}

                <div className="flex items-center gap-2 p-2 cursor-default">
                    {offLine && (
                        <>
                            <span className="opacity-50">
                                <Icon icon={CloudXIcon} fontSize={21} />
                            </span>
                            <span className="opacity-50">Offline</span>
                        </>
                    )}
                    {!offLine && syncing && (
                        <>
                            <Icon icon={CloudIcon} fontSize={21} />
                            Saving...
                        </>
                    )}
                    {!offLine && !syncing && (
                        <>
                            <Icon icon={CloudCheckIcon} fontSize={21} />
                            Saved
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center">
                <AiSuggestions />
                <Theme />
                <Settings />
            </div>
        </header>
    );
};

export default memo(Header);
