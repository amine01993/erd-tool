import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Icon } from "@iconify/react";
import { AttributeType } from "@/app/enum/AttributeType";
import useErdItemsStore from "@/app/store/erd-items";
import cc from "classcat";

export interface EntityData {
    name: string;
    attributes: AttributeData[];
}

export interface AttributeData {
    name: string;
    type: AttributeType;
    isNullable?: boolean;
    defaultValue?: any;
    isCurrent?: boolean;
    isPrimaryKey?: boolean;
    isAutoIncrement?: boolean;
    isUnique?: boolean;
    isForeignKey?: boolean;
    foreignKeyTable?: string;
    foreignKeyColumn?: string;
    length?: number;
    precision?: number;
    scale?: number;
    description?: string;
    isUnicode?: boolean;
}

const EntityNode = (props: { data: EntityData }) => {
    const { name, attributes } = props.data;
    const { selectedItem } = useErdItemsStore();

    return (
        <div className={cc(["entity-node", selectedItem])}>
            <h3 className="title">
                <div
                    className="drag-handle"
                    style={{ display: selectedItem === "selector" ? undefined : "none" }}
                >
                    <Icon
                        icon="tabler:dots-vertical"
                        width="15"
                        height="24"
                        className="-mr-2.5"
                    />
                    <Icon icon="tabler:dots-vertical" width="15" height="24" />
                </div>
                <div className="name nodrag">{name}</div>
            </h3>
            <ol className="attributes nodrag">
                {attributes.map((attr, index) => (
                    <li key={index}>
                        {attr.name}: {attr.type}
                    </li>
                ))}
            </ol>
            <Handle id="b" type="target" position={Position.Top} />
            <Handle id="a" type="source" position={Position.Bottom} />
        </div>
    );
};

export default memo(EntityNode);
