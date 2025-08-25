import {
    memo,
    MouseEvent,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from "react";
import useErdStore from "@/app/store/erd";
import InputField from "../widgets/InputField";
import { EntityData } from "../../type/EntityType";
import AttributeList from "./AttributeList";
import AttributeForm from "./AttributeForm";
import { entityFormReducer, initialEntityState, useEntityForm } from "@/app/hooks/EntityForm";

const EntityInfo = () => {
    const selectedNodeId = useErdStore(state => state.selectedNodeId);
    const nodes = useErdStore(state => state.nodes);
    const removeAttribute = useErdStore(state => state.removeAttribute);
    const updateEntityName = useErdStore(state => state.updateEntityName);
    const [selectedData, setSelectedData] = useState<EntityData>();
    const [editingAttribute, setEditingAttribute] = useState<string | null>(
        null
    );
    const [state, dispatch] = useReducer(entityFormReducer, initialEntityState);
    const { handleNameChange, handleNameBlur } = useEntityForm(dispatch);

    const handleAttributeAdd = useCallback(() => {
        setEditingAttribute("");
    }, []);

    const handleAttributeEdit = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            const attributeId = event.currentTarget.dataset.id;
            if (attributeId) {
                setEditingAttribute(attributeId);
            }
        },
        []
    );

    const handleAttributeRemove = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            const attributeId = event.currentTarget.dataset.id;
            if (selectedNodeId && attributeId) {
                setSelectedData((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        attributes: prev.attributes.filter(
                            (attr) => attr.id !== attributeId
                        ),
                    };
                });
                removeAttribute(selectedNodeId, attributeId);
            }
        },
        [selectedNodeId]
    );

    useEffect(() => {
        if (selectedNodeId) {
            const selectedData = nodes.find(
                (node) => node.id === selectedNodeId
            )?.data;
            if (selectedData) {
                dispatch({
                    type: "SET_FIELD",
                    value: selectedData.name || "",
                });
                setSelectedData(selectedData);
            }
            setEditingAttribute(null);
        }
    }, [selectedNodeId]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (selectedNodeId && state.isValid) {
            timeoutId = setTimeout(() => {
                updateEntityName(selectedNodeId, state.value);
            }, 300);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
    }, [selectedNodeId, state.value, state.isValid]);

    return (
        <div className="entity-info">
            {selectedNodeId && (
                <>
                    <div className="details">
                        <InputField
                            label="Entity"
                            value={state.value}
                            onChange={handleNameChange}
                            required
                            error={state.error}
                            touched={state.touched}
                            onBlur={handleNameBlur}
                        />

                        {selectedData && (
                            <>
                                {editingAttribute === null && (
                                    <AttributeList
                                        selectedData={selectedData}
                                        onEdit={handleAttributeEdit}
                                        onRemove={handleAttributeRemove}
                                        onAdd={handleAttributeAdd}
                                    />
                                )}
                                {(editingAttribute ||
                                    editingAttribute === "") && (
                                    <AttributeForm
                                        editingAttribute={editingAttribute}
                                        selectedData={selectedData}
                                        setEditingAttribute={
                                            setEditingAttribute
                                        }
                                        setSelectedData={setSelectedData}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default memo(EntityInfo);
