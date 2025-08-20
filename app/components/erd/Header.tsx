import Image from "next/image";
import { memo, useCallback, useEffect, useMemo } from "react";
import { Hub } from "@aws-amplify/core";
import { Icon } from "@iconify/react";
import classNames from "classnames";
import Theme from "../widgets/Theme";
import Settings from "../widgets/Settings";
import useDiagramStore from "@/app/store/diagram";
import useUserStore from "@/app/store/user";
import Cloud from "../icons/Cloud";
import CloudCheck from "../icons/CloudCheck";

const Header = () => {
    const { setAuthData } = useUserStore();

    const {
        loading,
        persisting,
        persistingNew,
        persistingViewport,
        persistingDelete,
        selectedDiagram,
        disableUndo,
        disableRedo,
        createDiagram,
        duplicateDiagram,
        deleteDiagram,
        undoAction,
        redoAction,
    } = useDiagramStore();

    const isSaving = useMemo(() => {
        return (
            persisting > 0 ||
            persistingNew > 0 ||
            persistingViewport > 0 ||
            persistingDelete
        );
    }, [persisting, persistingNew, persistingViewport, persistingDelete]);

    const handleUndo = useCallback(() => {
        undoAction();
    }, [undoAction]);

    const handleRedo = useCallback(() => {
        redoAction();
    }, [redoAction]);

    const handleNewDiagram = useCallback(() => {
        createDiagram();
    }, [createDiagram]);

    const handleDuplicateDiagram = useCallback(() => {
        duplicateDiagram();
    }, [duplicateDiagram]);

    const handleDeleteDiagram = useCallback(() => {
        deleteDiagram();
    }, [deleteDiagram]);

    useEffect(() => {
        const unsubscribe = Hub.listen("auth", async ({ payload }) => {
            console.log("Hub.auth", payload);
            switch (payload.event) {
                case "signedIn":
                    console.log("user have been signedIn successfully.");
                    setAuthData();
                    break;
                case "signedOut":
                    console.log("user have been signedOut successfully.");
                    break;
                case "tokenRefresh":
                    console.log("auth tokens have been refreshed.");
                    break;
                case "tokenRefresh_failure":
                    console.log("failure while refreshing auth tokens.");
                    break;
            }
        });
        setAuthData();

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <header
            className={classNames(
                "flex items-center justify-between px-3 py-2 bg-[#fefbfb] text-[#640D14]",
                "border-b border-[#640D14]"
            )}
        >
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
                    <Icon icon="tabler:arrow-back-up" fontSize={21} />
                </button>

                <button
                    aria-label="Redo"
                    className="header-btn"
                    onClick={handleRedo}
                    disabled={disableRedo || loading}
                >
                    <Icon icon="tabler:arrow-forward-up" fontSize={21} />
                </button>

                <button
                    aria-label="Create new diagram"
                    className="header-btn"
                    onClick={handleNewDiagram}
                >
                    <Icon icon="tabler:circle-plus" fontSize={21} />
                </button>

                {selectedDiagram !== "" && (
                    <>
                        <button
                            aria-label="Duplicate selected diagram"
                            className="header-btn"
                            onClick={handleDuplicateDiagram}
                            disabled={loading}
                        >
                            <Icon icon="tabler:layers-subtract" fontSize={21} />
                        </button>
                        <button
                            aria-label="Delete selected diagram"
                            className="header-btn"
                            onClick={handleDeleteDiagram}
                            disabled={loading}
                        >
                            <Icon icon="tabler:trash" fontSize={21} />
                        </button>
                    </>
                )}

                <button className="flex items-center gap-2 header-btn" disabled={loading}>
                    <Icon icon="tabler:database-export" fontSize={21} />
                    Export
                </button>

                <div className="flex items-center gap-2 p-2">
                    {isSaving && (
                        <>
                            <Cloud fontSize={21} />
                            Saving...
                        </>
                    )}
                    {!isSaving && (
                        <>
                            <CloudCheck fontSize={21} />
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
