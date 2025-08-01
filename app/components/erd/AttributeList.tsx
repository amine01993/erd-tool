import { memo, MouseEvent } from "react";
import { EntityData } from "../../type/EntityType";
import { Icon } from "@iconify/react";

interface AttributeListProps {
    selectedData: EntityData;
    onEdit: (event: MouseEvent<HTMLButtonElement>) => void
    onRemove: (event: MouseEvent<HTMLButtonElement>) => void;
    onAdd: () => void;
}

const AttributeList = ({ selectedData, onEdit, onRemove, onAdd }: AttributeListProps) => {
    return (
        <ul className="mt-3 flex flex-col gap-2">
            {selectedData.attributes.map((attr, index) => (
                <li key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                        {attr.name} ({attr.type})
                    </div>
                    <button
                        className="edit-attribute-btn"
                        aria-label="Edit attribute"
                        data-id={attr.id}
                        onClick={onEdit}
                    >
                        <Icon icon="tabler:edit" width="20" height="20" />
                    </button>
                    <button
                        className="remove-attribute-btn"
                        aria-label="Remove attribute"
                        data-id={attr.id}
                        onClick={onRemove}
                    >
                        <Icon icon="tabler:trash" width="20" height="20" />
                    </button>
                </li>
            ))}
            <li>
                <button
                    className="add-attribute-btn"
                    onClick={onAdd}
                >
                    <Icon icon="tabler:plus" width="20" height="20" />
                    Add Attribute
                </button>
            </li>
        </ul>
    );
};

export default memo(AttributeList);
