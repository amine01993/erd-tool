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
import useDiagramStore from "@/app/store/diagram";
import useUserStore from "@/app/store/user";
import Theme from "../widgets/Theme";
import Settings from "../widgets/Settings";
import useDeleteDiagram from "@/app/hooks/DiagramDelete";
import useAddDiagram from "@/app/hooks/DiagramAdd";
import { queryClient } from "@/app/helper/variables";

const Header = () => {
    const offLine = useUserStore(state => state.offLine);
    const retrieveAuthData = useUserStore(state => state.retrieveAuthData);
    const emptyAuthData = useUserStore(state => state.emptyAuthData);
    const mutationAdd = useAddDiagram();
    const mutationDelete = useDeleteDiagram();

    const loading = useDiagramStore(state => state.loading);
    const syncing = useDiagramStore(state => state.syncing);
    const selectedDiagram = useDiagramStore(state => state.selectedDiagram);
    const disableUndo = useDiagramStore(state => state.disableUndo);
    const disableRedo = useDiagramStore(state => state.disableRedo);
    const diagramsLength = useDiagramStore((state) => state.diagrams.length);
    const emptyDiagrams = useDiagramStore(state => state.emptyDiagrams);
    const createDiagram = useDiagramStore(state => state.createDiagram);
    const duplicateDiagram = useDiagramStore(state => state.duplicateDiagram);
    const deleteDiagram = useDiagramStore(state => state.deleteDiagram);
    const undoAction = useDiagramStore(state => state.undoAction);
    const redoAction = useDiagramStore(state => state.redoAction);

    const handleUndo = useCallback(() => {
        undoAction();
    }, [undoAction]);

    const handleRedo = useCallback(() => {
        redoAction();
    }, [redoAction]);

    const handleDiagramsRefresh = useCallback(() => {
        emptyDiagrams();
        queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    }, []);

    const handleNewDiagram = useCallback(() => {
        createDiagram(mutationAdd);
    }, [createDiagram]);

    const handleDuplicateDiagram = useCallback(() => {
        duplicateDiagram(mutationAdd);
    }, [duplicateDiagram]);

    const handleDeleteDiagram = useCallback(() => {
        deleteDiagram(mutationDelete, mutationAdd);
    }, [deleteDiagram]);

    useEffect(() => {
        function initAuthData() {
            retrieveAuthData()
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: ["diagrams"] });
                })
                .catch((error) => {
                    console.error("Error retrieving auth data:", error);
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

                <button
                    aria-label="Undo last action"
                    className="header-btn"
                    onClick={handleUndo}
                    disabled={disableUndo || loading}
                >
                    <Icon icon={ArrowBackUpIcon} fontSize={21} />
                </button>

                <button
                    aria-label="Redo"
                    className="header-btn"
                    onClick={handleRedo}
                    disabled={disableRedo || loading}
                >
                    <Icon icon={ArrowForwardUpIcon} fontSize={21} />
                </button>

                <button
                    aria-label="Refresh diagrams' list"
                    className={cc([
                        "header-btn",
                        { "animate-spin": diagramsLength === 0 },
                    ])}
                    onClick={handleDiagramsRefresh}
                    disabled={diagramsLength === 0}
                >
                    <Icon icon={RefreshIcon} fontSize={21} />
                </button>

                <button
                    aria-label="Create new diagram"
                    className="header-btn"
                    onClick={handleNewDiagram}
                >
                    <Icon icon={CirclePlusIcon} fontSize={21} />
                </button>

                {selectedDiagram !== "" && (
                    <>
                        <button
                            aria-label="Duplicate selected diagram"
                            className="header-btn"
                            onClick={handleDuplicateDiagram}
                            disabled={loading}
                        >
                            <Icon icon={LayersSubtractIcon} fontSize={21} />
                        </button>
                        <button
                            aria-label="Delete selected diagram"
                            className="header-btn"
                            onClick={handleDeleteDiagram}
                            disabled={loading}
                        >
                            <Icon icon={TrashIcon} fontSize={21} />
                        </button>
                    </>
                )}

                <button
                    className="flex items-center gap-2 header-btn"
                    disabled={loading}
                >
                    <Icon icon={DatabaseExportIcon} fontSize={21} />
                    Export
                </button>

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
                <Theme />
                <Settings />
            </div>
        </header>
    );
};

export default memo(Header);
