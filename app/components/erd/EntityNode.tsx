import { memo, useMemo } from "react";
import { Handle, NodeResizer, Position } from "@xyflow/react";
import { Icon } from "@iconify/react";
import DotsVerticalIcon from "@iconify/icons-tabler/dots-vertical";
import NotesIcon from "@iconify/icons-tabler/notes";
import cc from "classcat";
import useErdItemsStore from "@/app/store/erd-items";
import useErdStore from "@/app/store/erd";
import { AttributeData, EntityData } from "../../type/EntityType";
import Tooltip from "./Tooltip";

interface AttributeDataProps {
    data: AttributeData;
}

const AttributeNode = memo(({ data }: AttributeDataProps) => {
    const nullable = useMemo(() => {
        return !data.isPrimaryKey && data.isNullable;
    }, [data.isPrimaryKey, data.isNullable]);

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex-1 truncate space-x-0.5">
                    <span className="inline-flex items-center">
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
                        {data.description && (
                            // <span>
                            <Icon
                                icon={NotesIcon}
                                className="inline ml-0.5 text-gray-500"
                            />
                            // </span>
                        )}
                    </span>
                    {data.isPrimaryKey && <span className="">(PK)</span>}
                    {data.isForeignKey && <span className="">(FK)</span>}
                    {data.defaultValue && (
                        <span className="font-semibold">
                            [{data.defaultValue}]
                        </span>
                    )}
                </div>
                <div className="shrink-0">{data.type}</div>
            </div>
            {data.description && (
                <Tooltip
                    message={data.description}
                    position="right"
                    selector={`#${data.id}`}
                    props={{ className: "text-[12px]! w-32 whitespace-normal" }}
                />
            )}
        </>
    );
});

const EntityNode = (props: { id: string; data: EntityData }) => {
    const {
        id,
        data: { name, attributes },
    } = props;
    const selectedItem = useErdItemsStore((state) => state.selectedItem);
    const edges = useErdStore((state) => state.edges);

    const connectedAttributes = useMemo(() => {
        const entityEdges = edges.filter((edge) => {
            return edge.source === id || edge.target === id;
        });

        return attributes
            .filter((attr) => {
                return entityEdges.find(
                    (e) =>
                        (e.data?.foreignKeyColumn === attr.name &&
                            name === e.data.foreignKeyTable) ||
                        (e.data?.primaryKeyColumn === attr.name &&
                            name === e.data.primaryKeyTable)
                );
            })
            .map((attr) => attr.id);
    }, [edges, name, id]);

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
                    <li
                        key={attr.id}
                        id={attr.id}
                        className={cc([
                            "relative",
                            connectedAttributes.includes(attr.id)
                                ? "connected"
                                : undefined,
                        ])}
                    >
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
