import {
    ActionDispatch,
    ChangeEvent,
    RefObject,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import useErdStore from "../store/erd";
import { attributeTypes } from "@/app/type/AttributeType";
import {
    AttributeFormAction,
    AttributeFormState,
} from "../type/AttributeFormType";
import {
    validateDefault,
    validateLength,
    validateName,
    validatePrecision,
    validateScale,
} from "../helper/validation";

export function useAttributeForm(
    attributesRef: RefObject<HTMLDivElement | null>,
    state: AttributeFormState,
    dispatch: ActionDispatch<[action: AttributeFormAction]>,
    attributeId?: string
) {
    const selectedNodeId = useErdStore(state => state.selectedNodeId);
    const nodes = useErdStore(state => state.nodes);

    const attributeNames = useMemo(() => {
        const names = new Set<string>();
        if (selectedNodeId) {
            for (const node of nodes) {
                if (node.id === selectedNodeId) {
                    node.data.attributes.forEach((a) => {
                        if (!attributeId || attributeId !== a.id) {
                            names.add(a.name);
                        }
                    });
                    break;
                }
            }
        }
        return names;
    }, [selectedNodeId, attributeId]);
    const typeOptions = useMemo(() => {
        return Object.keys(attributeTypes).map((type) => ({
            value: type,
            label: type,
        }));
    }, []);
    const showLength = useMemo(() => {
        return state.values.type === "string";
    }, [state.values.type]);
    const showPrecisionAndScale = useMemo(() => {
        return ["numeric"].includes(state.values.type);
    }, [state.values.type]);
    const showDefaultAndCurrent = useMemo(() => {
        return (
            state.values.type !== "geography" && state.values.type !== "uuid"
        );
    }, [state.values.type]);
    const showCurrent = useMemo(() => {
        return ["time", "date", "datetime", "timestamp"].includes(
            state.values.type
        );
    }, [state.values.type]);
    const showAutoIncrement = useMemo(() => {
        return [
            "smallint",
            "integer",
            "largeint",
            "float",
            "double",
            "numeric",
        ].includes(state.values.type);
    }, [state.values.type]);
    const showUnicode = useMemo(() => {
        return state.values.type === "string";
    }, [state.values.type]);
    const showNullable = useMemo(() => {
        return !state.values.isPrimaryKey;
    }, [state.values.isPrimaryKey]);
    const isDefaultValueDisabled = useMemo(() => {
        return state.values.isCurrent;
    }, [state.values.isCurrent]);

    const handleInputField = useCallback(
        (field: keyof AttributeFormState["values"]) => {
            return (event: ChangeEvent<HTMLInputElement>) => {
                dispatch({
                    type: "SET_FIELD",
                    field,
                    value: event.target.value,
                    attributeNames,
                });
            };
        },
        []
    );
    const handleTextareaField = useCallback(
        (field: keyof AttributeFormState["values"]) => {
            return (event: ChangeEvent<HTMLTextAreaElement>) => {
                dispatch({
                    type: "SET_FIELD",
                    field,
                    value: event.target.value,
                });
            };
        },
        []
    );
    const handleSelectField = useCallback(
        (field: keyof AttributeFormState["values"]) => {
            return (event: ChangeEvent<HTMLSelectElement>) => {
                dispatch({
                    type: "SET_FIELD",
                    field,
                    value: event.target.value,
                });
            };
        },
        []
    );
    const handleCheckBoxField = useCallback(
        (field: keyof AttributeFormState["values"]) => {
            return (event: ChangeEvent<HTMLInputElement>) => {
                dispatch({
                    type: "SET_FIELD",
                    field,
                    value: event.target.checked,
                });
            };
        },
        []
    );

    const handleNameChange = useCallback(handleInputField("name"), []);
    const handleTypeChange = useCallback(handleSelectField("type"), []);
    const handleLengthChange = useCallback(handleInputField("length"), []);
    const handlePrecisionChange = useCallback(
        handleInputField("precision"),
        []
    );
    const handleScaleChange = useCallback(handleInputField("scale"), []);
    const handleNullableChange = useCallback(
        handleCheckBoxField("isNullable"),
        []
    );
    const handleDefaultChange = useCallback(
        handleInputField("defaultValue"),
        []
    );
    const handleCurrentChange = useCallback(
        handleCheckBoxField("isCurrent"),
        []
    );
    const handlePrimaryKeyChange = useCallback(
        handleCheckBoxField("isPrimaryKey"),
        []
    );
    const handleAutoIncrementChange = useCallback(
        handleCheckBoxField("isAutoIncrement"),
        []
    );
    const handleUniqueChange = useCallback(handleCheckBoxField("isUnique"), []);
    const handleUnicodeChange = useCallback(
        handleCheckBoxField("isUnicode"),
        []
    );
    const handleDescriptionChange = useCallback(
        handleTextareaField("description"),
        []
    );

    const checkTouch = useCallback(
        (field: keyof AttributeFormState["touched"]) => {
            return () => {
                dispatch({ type: "SET_TOUCHED", field });
            };
        },
        []
    );

    const handleNameBlur = useCallback(checkTouch("name"), []);
    const handleLengthBlur = useCallback(checkTouch("length"), []);
    const handleDefaultBlur = useCallback(checkTouch("defaultValue"), []);
    const handlePrecisionBlur = useCallback(checkTouch("precision"), []);
    const handleScaleBlur = useCallback(checkTouch("scale"), []);

    useEffect(() => {
        if (attributesRef.current) {
            // is scrollbar showing
            if (
                attributesRef.current.scrollHeight >
                attributesRef.current.clientHeight
            ) {
                attributesRef.current.classList.add("with-scrollbar");
            } else {
                attributesRef.current.classList.remove("with-scrollbar");
            }
        }
    }, [state.values.type, state.values.isPrimaryKey, state.errors]);

    return {
        typeOptions,
        showLength,
        showAutoIncrement,
        showDefaultAndCurrent,
        showCurrent,
        showNullable,
        showUnicode,
        showPrecisionAndScale,
        isDefaultValueDisabled,
        handleNameBlur,
        handleLengthBlur,
        handlePrecisionBlur,
        handleDefaultBlur,
        handleScaleBlur,
        handleAutoIncrementChange,
        handleDefaultChange,
        handleDescriptionChange,
        handleUnicodeChange,
        handleCurrentChange,
        handleNameChange,
        handleNullableChange,
        handleUniqueChange,
        handlePrecisionChange,
        handlePrimaryKeyChange,
        handleScaleChange,
        handleTypeChange,
        handleLengthChange,
    };
}

export const initialAttributeFormState: AttributeFormState = {
    values: {
        name: "",
        type: "string",
        isNullable: true,
        defaultValue: null,
        isCurrent: false,
        isPrimaryKey: false,
        isAutoIncrement: false,
        isUnique: false,
        length: 255,
        precision: 10,
        scale: 0,
        description: "",
        isUnicode: false,
    },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
};

const validateAttributeField = (
    field: string,
    value: string,
    state: AttributeFormState,
    attributeNames?: Set<string>
): string | null => {
    let validation;
    switch (field) {
        case "name":
            validation = validateName(value, attributeNames);
            return validation.valid ? null : validation.errors[0];
        case "defaultValue":
            validation = validateDefault(value, state.values.type);
            return validation.valid ? null : validation.errors[0];
        case "length":
            validation = validateLength(value);
            return validation.valid ? null : validation.errors[0];
        case "scale":
            validation = validateScale(value, String(state.values.precision));
            return validation.valid ? null : validation.errors[0];
        case "precision":
            validation = validatePrecision(value);
            return validation.valid ? null : validation.errors[0];
        default:
            return null;
    }
};

export const attributeFormReducer = (
    state: AttributeFormState,
    action: AttributeFormAction
): AttributeFormState => {
    switch (action.type) {
        case "SET_VALUES": {
            return {
                ...state,
                values: {
                    ...state.values,
                    ...action.values,
                },
            };
        }
        case "SET_FIELD": {
            const newValues = { ...state.values, [action.field]: action.value };
            let errors = { ...state.errors };
            if (
                [
                    "name",
                    "defaultValue",
                    "length",
                    "precision",
                    "scale",
                ].includes(action.field)
            ) {
                const error = validateAttributeField(
                    action.field,
                    String(action.value).trim(),
                    state,
                    action.attributeNames
                );
                if (error) {
                    errors[action.field as keyof AttributeFormState["errors"]] =
                        error;
                } else {
                    delete errors[
                        action.field as keyof AttributeFormState["errors"]
                    ];
                }
            }

            return {
                ...state,
                values: newValues,
                errors,
                isValid: Object.keys(errors).length === 0,
            };
        }

        case "SET_TOUCHED":
            return {
                ...state,
                touched: { ...state.touched, [action.field]: true },
            };

        case "SET_SUBMITTING":
            return {
                ...state,
                isSubmitting: action.isSubmitting,
            };

        default:
            return state;
    }
};
