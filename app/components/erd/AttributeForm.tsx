import {
    Dispatch,
    memo,
    SetStateAction,
    useCallback,
    useEffect,
    useReducer,
    useRef,
} from "react";
import { nanoid } from "nanoid";
import { Icon } from "@iconify/react";
import InputField from "../widgets/InputField";
import SelectField from "../widgets/SelectField";
import CheckBoxField from "../widgets/CheckBoxField";
import TextAreaField from "../widgets/TextAreaField";
import {
    attributeFormReducer,
    initialAttributeFormState,
    useAttributeForm,
} from "@/app/hooks/AttributeForm";
import useErdStore from "@/app/store/erd";
import { AttributeData, EntityData } from "@/app/type/EntityType";

interface AttributeFormProps {
    selectedData: EntityData;
    editingAttribute: string | null;
    setEditingAttribute: Dispatch<SetStateAction<string | null>>;
    setSelectedData: Dispatch<SetStateAction<EntityData | undefined>>;
}

const AttributeForm = ({
    selectedData,
    editingAttribute,
    setEditingAttribute,
    setSelectedData,
}: AttributeFormProps) => {
    const attributesRef = useRef<HTMLDivElement>(null);
    const { selectedNodeId, addAttribute, editAttribute } = useErdStore();

    const [state, dispatch] = useReducer(
        attributeFormReducer,
        initialAttributeFormState
    );
    const {
        typeOptions,
        showAutoIncrement,
        showNullable,
        showDefaultAndCurrent,
        showCurrent,
        showUnicode,
        showLength,
        showPrecisionAndScale,
        referenceOptions,
        referenceColumn,
        isDefaultValueDisabled,
        handleNameBlur,
        handleLengthBlur,
        handleDefaultBlur,
        handlePrecisionBlur,
        handleScaleBlur,
        handleNameChange,
        handleTypeChange,
        handleLengthChange,
        handlePrecisionChange,
        handleScaleChange,
        handleDefaultChange,
        handleCurrentChange,
        handlePrimaryKeyChange,
        handleAutoIncrementChange,
        handleUniqueChange,
        handleForeignKeyChange,
        handleReferenceChange,
        handleNullableChange,
        handleDescriptionChange,
        handleUnicodeChange,
    } = useAttributeForm(
        attributesRef,
        state,
        dispatch,
        selectedNodeId ?? undefined,
        editingAttribute ?? undefined
    );

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!selectedNodeId) return;

            dispatch({ type: "SET_TOUCHED", field: "name" });
            dispatch({ type: "SET_TOUCHED", field: "defaultValue" });
            dispatch({ type: "SET_TOUCHED", field: "length" });
            dispatch({ type: "SET_TOUCHED", field: "precision" });
            dispatch({ type: "SET_TOUCHED", field: "scale" });

            // dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

            if (state.isValid) {
                if (editingAttribute) {
                    const attribute: AttributeData = {
                        id: editingAttribute,
                        ...state.values,
                    };
                    editAttribute(selectedNodeId, attribute);
                    setSelectedData((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            attributes: prev.attributes.map((attr) =>
                                attr.id === editingAttribute ? attribute : attr
                            ),
                        };
                    });
                } else {
                    const attribute: AttributeData = {
                        id: nanoid(5),
                        ...state.values,
                    };
                    addAttribute(selectedNodeId, attribute);
                    setSelectedData((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            attributes: [...prev.attributes, attribute],
                        };
                    });
                }
                setEditingAttribute(null);
            }
            // dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
        },
        [
            selectedNodeId,
            state.isValid,
            state.values,
            editingAttribute,
            addAttribute,
            editAttribute,
        ]
    );

    const handleBack = useCallback(() => {
        setEditingAttribute(null);
    }, []);

    useEffect(() => {
        if (editingAttribute) {
            const attribute = selectedData.attributes.find(
                (attr) => attr.id === editingAttribute
            );
            if (attribute) {
                dispatch({ type: "SET_VALUES", values: attribute });
            }
        }
    }, [editingAttribute]);

    return (
        <div className="attribute-form" ref={attributesRef}>
            <h2 className="text-lg font-semibold">Attribute Form</h2>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                <InputField
                    label="Name"
                    value={state.values.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    placeholder="Attribute name"
                    required
                    error={state.errors.name}
                    touched={state.touched.name}
                />
                <SelectField
                    label="Type"
                    list={typeOptions}
                    value={state.values.type}
                    onChange={handleTypeChange}
                />
                {showLength && (
                    <InputField
                        label="Length"
                        value={state.values.length}
                        type="number"
                        onChange={handleLengthChange}
                        onBlur={handleLengthBlur}
                        error={state.errors.length}
                        touched={state.touched.length}
                    />
                )}
                {showPrecisionAndScale && (
                    <>
                        <InputField
                            label="Precision"
                            value={state.values.precision}
                            type="number"
                            onChange={handlePrecisionChange}
                            onBlur={handlePrecisionBlur}
                            error={state.errors.precision}
                            touched={state.touched.precision}
                        />
                        <InputField
                            label="Scale"
                            value={state.values.scale}
                            type="number"
                            onChange={handleScaleChange}
                            onBlur={handleScaleBlur}
                            error={state.errors.scale}
                            touched={state.touched.scale}
                        />
                    </>
                )}
                {showDefaultAndCurrent && (
                    <>
                        <InputField
                            label="Default"
                            value={state.values.defaultValue}
                            placeholder="Default value"
                            onChange={handleDefaultChange}
                            onBlur={handleDefaultBlur}
                            disabled={isDefaultValueDisabled}
                            error={state.errors.defaultValue}
                            touched={state.touched.defaultValue}
                        />
                        {showCurrent && (
                            <CheckBoxField
                                label="Current"
                                checked={state.values.isCurrent}
                                onChange={handleCurrentChange}
                            />
                        )}
                    </>
                )}
                <CheckBoxField
                    label="Primary Key"
                    checked={state.values.isPrimaryKey}
                    onChange={handlePrimaryKeyChange}
                />
                {showAutoIncrement && (
                    <CheckBoxField
                        label="Auto Increment"
                        checked={state.values.isAutoIncrement}
                        onChange={handleAutoIncrementChange}
                    />
                )}
                <CheckBoxField
                    label="Unique"
                    checked={state.values.isUnique}
                    onChange={handleUniqueChange}
                />
                <CheckBoxField
                    label="Foreign Key"
                    checked={state.values.isForeignKey}
                    onChange={handleForeignKeyChange}
                />
                <SelectField
                    label="Reference"
                    list={referenceOptions}
                    value={referenceColumn}
                    onChange={handleReferenceChange}
                />
                {showNullable && (
                    <CheckBoxField
                        label="Nullable"
                        checked={state.values.isNullable}
                        onChange={handleNullableChange}
                    />
                )}
                {showUnicode && (
                    <CheckBoxField
                        label="Unicode"
                        checked={state.values.isUnicode}
                        onChange={handleUnicodeChange}
                    />
                )}
                <TextAreaField
                    label="Description"
                    value={state.values.description}
                    placeholder="Enter description"
                    onChange={handleDescriptionChange}
                />

                <div className="actions">
                    <button className="back-btn" onClick={handleBack}>
                        <Icon
                            icon="tabler:chevron-left"
                            width="20"
                            height="20"
                        />
                        Back
                    </button>
                    <button type="submit" className="submit-btn">
                        <Icon
                            icon="tabler:device-floppy"
                            width="20"
                            height="20"
                        />
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default memo(AttributeForm);
