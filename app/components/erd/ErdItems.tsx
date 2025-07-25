import Image from "next/image";
import { Icon } from "@iconify/react";
import { Panel } from "@xyflow/react";
import cc from "classcat";
import useErdItemsStore from "@/app/store/erd-items";
import { useCallback } from "react";

const ErdItems = () => {
    const { selectedItem, selectItem } = useErdItemsStore();

    const handleSelection = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const item = event.currentTarget.dataset.id as "selector" | "entity" | "edge";
        selectItem(item);
    }, []);

    return (
        <Panel position="center-left" className="bg-gray-white p-1 shadow-md">
            <ul className="erd-items">
                <li>
                    <button
                        title="Select to Move and Resize Nodes"
                        data-id="selector"
                        onClick={handleSelection}
                        className={cc([
                            { "inset-shadow-md": selectedItem === "selector" },
                        ])}
                    >
                        <Icon
                            icon="tabler:location-filled"
                            width={24}
                            height={24}
                        />
                    </button>
                </li>
                <li>
                    <button
                        title="Select to Add Entities"
                        data-id="entity"
                        onClick={handleSelection}
                        className={cc([
                            { "inset-shadow-md": selectedItem === "entity" },
                        ])}
                    >
                        <Image
                            src="/entity-icon.svg"
                            alt="Entity Icon"
                            width={24}
                            height={24}
                        />
                    </button>
                </li>
                <li>
                    <button
                        title="Select to Add Edges"
                        data-id="edge"
                        onClick={handleSelection}
                        className={cc([
                            { "inset-shadow-md": selectedItem === "edge" },
                        ])}
                    >
                        <Image
                            src="/edge-icon.svg"
                            alt="Edge Icon"
                            width={24}
                            height={24}
                        />
                    </button>
                </li>
            </ul>
        </Panel>
    );
};

export default ErdItems;
