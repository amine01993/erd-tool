import { memo, useMemo } from "react";
import { Handle, NodeResizer, Position } from "@xyflow/react";
import { Icon } from "@iconify/react";
import DotsVerticalIcon from "@iconify/icons-tabler/dots-vertical";
import cc from "classcat";
import useErdItemsStore from "@/app/store/erd-items";
import { AttributeData, EntityData } from "../../type/EntityType";

const AttributeNode = memo(({ data }: { data: AttributeData }) => {
    const nullable = useMemo(() => {
        return !data.isPrimaryKey && data.isNullable;
    }, [data.isPrimaryKey, data.isNullable]);

    return (
        <div className="flex justify-between items-center">
            <div className="flex-1 truncate space-x-0.5">
                <span>
                    <span
                        className={cc([
                            {
                                "font-bold underline":
                                    data.isPrimaryKey || data.isForeignKey,
                            },
                        ])}
                    >
                        {data.name}
                    </span>
                    {nullable && <span className="italic">?</span>}
                </span>
                {data.isPrimaryKey && <span className="">(PK)</span>}
                {data.isForeignKey && <span className="">(FK)</span>}
                {data.defaultValue && (
                    <span className="font-semibold">[{data.defaultValue}]</span>
                )}
            </div>
            <div className="shrink-0">{data.type}</div>
        </div>
    );
});

const EntityNode = (props: { data: EntityData }) => {
    const { name, attributes } = props.data;
    const selectedItem = useErdItemsStore((state) => state.selectedItem);

    return (
        <div className="entity-node">
            <h3 className="title">
                <div
                    className={cc([
                        "drag-handle",
                        { nodrag: selectedItem !== "selector" },
                    ])}
                >
                    {selectedItem === "selector" && (
                        <>
                            <Icon
                                icon={DotsVerticalIcon}
                                width="15"
                                height="15"
                                className="-mr-2.5"
                            />
                            <Icon
                                icon={DotsVerticalIcon}
                                width="15"
                                height="15"
                            />
                        </>
                    )}
                </div>
                <div className="name nodrag">{name}</div>
            </h3>
            <ol className="attributes nodrag">
                {attributes.map((attr) => (
                    <li key={attr.id} id={attr.id}>
                        <AttributeNode data={attr} />
                    </li>
                ))}
            </ol>
            <NodeResizer minWidth={200} minHeight={100} />
            <Handle id="b" type="target" position={Position.Top} />
            <Handle id="a" type="source" position={Position.Bottom} />
        </div>
    );
};

export default memo(EntityNode);
