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
    dispatch: ActionDispatch<[action: AttributeFormAction]>
) {
    const { nodes } = useErdStore();

    const typeOptions = useMemo(() => {
        return Object.keys(attributeTypes).map((type) => ({
            value: type,
            label: type,
        }));
    }, []);
    const referenceOptions = useMemo(() => {
        const options = [];
        for (const node of nodes) {
            for (const attribute of node.data.attributes) {
                if (attribute.isPrimaryKey) {
                    options.push({
                        value: `${node.data.name}.${attribute.name}`,
                        label: `${node.data.name}.${attribute.name}`,
                    });
                }
            }
        }
        return options;
    }, []);
    const referenceColumn = useMemo(() => {
        if (!state.values.foreignKeyTable || !state.values.foreignKeyColumn)
            return "";
        return (
            state.values.foreignKeyTable + "." + state.values.foreignKeyColumn
        );
    }, [state.values.foreignKeyTable, state.values.foreignKeyColumn]);
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
                console.log("dispatch", field, event.target.value.trim());

                dispatch({
                    type: "SET_FIELD",
                    field,
                    value: event.target.value.trim(),
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
                    value: event.target.value.trim(),
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
    const handleForeignKeyChange = useCallback(
        handleCheckBoxField("isForeignKey"),
        []
    );
    const handleReferenceChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            const [table, column] = event.target.value.split(".");
            dispatch({
                type: "SET_FIELD",
                field: "foreignKeyTable",
                value: table,
            });
            dispatch({
                type: "SET_FIELD",
                field: "foreignKeyColumn",
                value: column,
            });
        },
        []
    );
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
    }, [state.values.type, state.values.isPrimaryKey]);

    return {
        typeOptions,
        referenceOptions,
        referenceColumn,
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
        handleReferenceChange,
        handleCurrentChange,
        handleNameChange,
        handleNullableChange,
        handleForeignKeyChange,
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
        isForeignKey: false,
        foreignKeyTable: "",
        foreignKeyColumn: "",
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
    state: AttributeFormState
): string | null => {
    let validation;
    switch (field) {
        case "name":
            validation = validateName(value);
            console.log("validateAttributeField", value, validation);
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
                    String(action.value),
                    state
                );
                if(error) {
                    errors[action.field as keyof AttributeFormState["errors"]] =error;
                }
                else {
                    delete errors[action.field as keyof AttributeFormState["errors"]]
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
