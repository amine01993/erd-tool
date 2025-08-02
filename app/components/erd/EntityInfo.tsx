import {
    ChangeEvent,
    memo,
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";
import useErdStore from "@/app/store/erd";
import InputField from "../widgets/InputField";
import { EntityData } from "../../type/EntityType";
import AttributeList from "./AttributeList";
import AttributeForm from "./AttributeForm";
import { validateName } from "@/app/helper/validation";

interface EntityFormState {
    value: string;
    error: string | undefined;
    touched: boolean;
    isValid: boolean;
}

type EntityFormAction =
    | {
          type: "SET_FIELD";
          value: string;
          entityNames?: Set<string>;
      }
    | { type: "SET_TOUCHED" };

const initialEntityState: EntityFormState = {
    value: "",
    error: undefined,
    touched: false,
    isValid: false,
};

const entityFormReducer = (
    state: EntityFormState,
    action: EntityFormAction
): EntityFormState => {
    switch (action.type) {
        case "SET_FIELD": {
            const validation = validateName(action.value, action.entityNames);

            const error = validation.valid ? undefined : validation.errors[0];

            return {
                ...state,
                value: action.value,
                error,
                isValid: !error,
            };
        }

        case "SET_TOUCHED":
            return {
                ...state,
                touched: true,
            };

        default:
            return state;
    }
};

const EntityInfo = () => {
    const { selectedNodeId, nodes, removeAttribute, updateEntityName } =
        useErdStore();
    const [selectedData, setSelectedData] = useState<EntityData>();
    const [editingAttribute, setEditingAttribute] = useState<string | null>(
        null
    );
    const [state, dispatch] = useReducer(entityFormReducer, initialEntityState);

    const entityNames = useMemo(() => {
        return new Set(nodes.map((node) => node.data.name));
    }, [nodes]);

    const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: "SET_FIELD",
            value: e.target.value,
            entityNames,
        });
    }, [entityNames]);

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

    const handleNameBlur = useCallback(() => {
        dispatch({ type: "SET_TOUCHED" });
    }, []);

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
