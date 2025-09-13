import { memo, SVGProps, useCallback, useEffect } from "react";
import { Panel } from "@xyflow/react";
import { Icon } from "@iconify/react";
import LocationFilledIcon from "@iconify/icons-tabler/location-filled";
import cc from "classcat";
import useErdItemsStore from "@/app/store/erd-items";
import useDiagramStore, { isReadOnlySelector } from "@/app/store/diagram";
import useUserStore, { isAnyModalOrMenuOpenSelector } from "@/app/store/user";
import Tooltip from "./Tooltip";
import useInputFocused from "@/app/hooks/InputFocused";

const EntityIcon = memo(function EntityIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 290 290"
            xmlSpace="preserve"
            {...props}
        >
            <path
                d="M260 290H30c-16.6 0-30-13.4-30-30V82h290v178c0 16.6-13.4 30-30 30"
                style={{ fill: "var(--color-12)" }}
            />
            <path
                d="M290 82H0V30C0 13.4 13.4 0 30 0h230c16.6 0 30 13.4 30 30zm-38.5 52h-213c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5h213c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5m0 48h-213c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5h213c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5m0 48h-213c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5h213c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5"
                style={{ fill: "var(--color-3)" }}
            />
        </svg>
    );
});

const EdgeIcon = memo(function EdgeIcon(props: SVGProps<SVGSVGElement>) {
    const lineStyle = {
        fill: "none",
        stroke: "var(--color-12)",
        strokeWidth: 25,
        strokeMiterlimit: 10,
    };
    const line2Style = {
        stroke: "var(--color-12)",
        strokeWidth: 25,
        strokeMiterlimit: 10,
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 290 290"
            xmlSpace="preserve"
            {...props}
        >
            <line style={lineStyle} x1="70.5" y1="221.5" x2="70.5" y2="80.5" />
            <line style={lineStyle} x1="264.5" y1="82.5" x2="198" y2="150.5" />
            <line style={lineStyle} x1="264.5" y1="212.5" x2="198" y2="144.5" />
            <line
                style={line2Style}
                x1="16.5"
                y1="147.5"
                x2="272.5"
                y2="147.5"
            />
        </svg>
    );
});

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
            className="erd-items-panel bg-(--color-13) p-1 shadow-md"
        >
            <ul className="erd-items select-none">
                <li id="selector-erd-item" className="relative">
                    <button
                        title="Select to Move and Resize Nodes"
                        data-id="selector"
                        onClick={handleSelection}
                        className={cc([
                            "text-(--color-12)",
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
                        <EntityIcon width={24} height={24} />
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
                        <EdgeIcon width={24} height={24} />
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

export default memo(ErdItemsPanel);
