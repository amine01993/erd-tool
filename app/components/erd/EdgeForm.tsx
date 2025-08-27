import { memo, useCallback, useEffect, useReducer } from "react";
import SelectField from "../widgets/SelectField";
import { EdgeInfoData } from "./EdgeInfo";
import {
    edgeFormReducer,
    initialEdgeFormState,
    useEdgeForm,
} from "@/app/hooks/EdgeForm";

interface EntityFormProps {
    selectedData: EdgeInfoData;
}

const EdgeForm = ({ selectedData }: EntityFormProps) => {
    const [state, dispatch] = useReducer(edgeFormReducer, initialEdgeFormState);
    const {
        foreignKeyOptions,
        primaryKeyOptions,
        cascadeOptions,
        handleForeignKeyChange,
        handleReferenceChange,
        handleOnDeleteChange,
        handleOnUpdateChange,
    } = useEdgeForm(selectedData, state, dispatch);

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
        },
        []
    );

    useEffect(() => {
        dispatch({
            type: "SET_VALUES",
            values: {
                ...selectedData.currentData,
            },
        });
    }, [selectedData]);

    return (
        <div className="edge-form">
            <h2 className="text-lg font-semibold">Foreign Key Options</h2>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                <SelectField
                    label="Foreign Key"
                    list={foreignKeyOptions}
                    value={state.values.foreignKey}
                    onChange={handleForeignKeyChange}
                />
                <SelectField
                    label="Reference"
                    list={primaryKeyOptions}
                    value={state.values.reference}
                    onChange={handleReferenceChange}
                />
                <SelectField
                    label="On Delete"
                    list={cascadeOptions}
                    value={state.values.onDelete}
                    onChange={handleOnDeleteChange}
                />
                <SelectField
                    label="On Update"
                    list={cascadeOptions}
                    value={state.values.onUpdate}
                    onChange={handleOnUpdateChange}
                />
            </form>
        </div>
    );
};

export default memo(EdgeForm);
