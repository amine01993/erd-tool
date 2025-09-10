import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Panel } from "@xyflow/react";
import { Icon } from "@iconify/react";
import LocationFilledIcon from "@iconify/icons-tabler/location-filled";
import cc from "classcat";
import useErdItemsStore from "@/app/store/erd-items";
import useDiagramStore, { isReadOnlySelector } from "@/app/store/diagram";
import useUserStore, { isAnyModalOrMenuOpenSelector } from "@/app/store/user";
import Tooltip from "./Tooltip";
import useInputFocused from "@/app/hooks/InputFocused";

const ErdItemsPanel = () => {
    const selectedItem = useErdItemsStore((state) => state.selectedItem);
    const selectItem = useErdItemsStore((state) => state.selectItem);
    const isReadOnly = useDiagramStore(isReadOnlySelector);
    const isAnyModalOrMenuOpen = useUserStore(isAnyModalOrMenuOpenSelector);
    const isInputFocused = useInputFocused();

    const handleSelection = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            if (isReadOnly) return;
            const item = event.currentTarget.dataset.id as
                | "selector"
                | "entity"
                | "edge";
            selectItem(item);
        },
        [isReadOnly]
    );

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!isAnyModalOrMenuOpen && !isInputFocused) {
                if (e.shiftKey && e.key.toLowerCase() === "s") {
                    e.preventDefault();
                    selectItem("selector");
                } else if (e.shiftKey && e.key.toLowerCase() === "e") {
                    e.preventDefault();
                    selectItem("entity");
                } else if (e.shiftKey && e.key.toLowerCase() === "d") {
                    e.preventDefault();
                    selectItem("edge");
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isAnyModalOrMenuOpen, isInputFocused, selectItem]);

    useEffect(() => {
        if (isReadOnly) {
            selectItem("selector");
        }
    }, [isReadOnly]);

    return (
        <Panel
            position="center-left"
            className="erd-items-panel bg-white p-1 shadow-md"
        >
            <ul className="erd-items select-none">
                <li id="selector-erd-item" className="relative">
                    <button
                        title="Select to Move and Resize Nodes"
                        data-id="selector"
                        onClick={handleSelection}
                        className={cc([
                            { "inset-shadow-md": selectedItem === "selector" },
                        ])}
                        disabled={isReadOnly}
                    >
                        <Icon
                            icon={LocationFilledIcon}
                            width={24}
                            height={24}
                        />
                    </button>
                    <Tooltip
                        message="Selector (Shift + S)"
                        selector="#selector-erd-item"
                        position="right"
                    />
                </li>
                <li id="entity-erd-item" className="relative">
                    <button
                        title="Select to Add Entities"
                        data-id="entity"
                        onClick={handleSelection}
                        className={cc([
                            { "inset-shadow-md": selectedItem === "entity" },
                        ])}
                        disabled={isReadOnly}
                    >
                        <Image
                            src="/entity-icon.svg"
                            alt="Entity Icon"
                            width={24}
                            height={24}
                        />
                    </button>
                    <Tooltip
                        message="Entity (Shift + E)"
                        selector="#entity-erd-item"
                        position="right"
                    />
                </li>
                <li id="edge-erd-item" className="relative">
                    <button
                        title="Select to Add Edges"
                        data-id="edge"
                        onClick={handleSelection}
                        className={cc([
                            { "inset-shadow-md": selectedItem === "edge" },
                        ])}
                        disabled={isReadOnly}
                    >
                        <Image
                            src="/edge-icon.svg"
                            alt="Edge Icon"
                            width={24}
                            height={24}
                        />
                    </button>
                    <Tooltip
                        message="Edge (Shift + D)"
                        selector="#edge-erd-item"
                        position="right"
                    />
                </li>
            </ul>
        </Panel>
    );
};

export default ErdItemsPanel;
