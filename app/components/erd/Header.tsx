import Image from "next/image";
import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import classNames from "classnames";
import useDiagramStore from "@/app/store/diagram";

const Header = () => {
    const { selectedDiagram, createDiagram, duplicateDiagram, deleteDiagram } =
        useDiagramStore();

    const handleNewDiagram = useCallback(() => {
        createDiagram();
    }, [createDiagram]);

    const handleDuplicateDiagram = useCallback(() => {
        duplicateDiagram();
    }, [duplicateDiagram]);

    const handleDeleteDiagram = useCallback(() => {
        deleteDiagram();
    }, [deleteDiagram]);

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
                        >
                            <Icon icon="tabler:layers-subtract" fontSize={21} />
                        </button>
                        <button
                            aria-label="Delete selected diagram"
                            className="header-btn"
                            onClick={handleDeleteDiagram}
                        >
                            <Icon icon="tabler:trash" fontSize={21} />
                        </button>
                    </>
                )}

                <button className="flex items-center gap-2 header-btn">
                    <Icon icon="tabler:database-export" fontSize={21} />
                    Export
                </button>

                <div className="flex items-center gap-2 p-2">
                    <Icon icon="tabler:cloud" fontSize={21} />
                    {/* <Icon icon="tabler:cloud-check" width="24" height="24" /> */}
                    Saving...
                </div>
            </div>
            <div className="flex items-center">
                {/* theme toggle */}
                <button aria-label="Toggle dark mode" className="">
                    <Icon icon="tabler:moon" fontSize={21} />
                </button>
            </div>
        </header>
    );
};

export default memo(Header);
