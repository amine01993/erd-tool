import { memo, useCallback, useEffect, useReducer } from "react";
import SelectField from "../widgets/SelectField";
import { EdgeInfoData } from "./EdgeInfo";
import {
    edgeFormReducer,
    initialEdgeFormState,
    useEdgeForm,
} from "@/app/hooks/EdgeForm";
import RadioBoxField from "../widgets/RadioBoxField";

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
        handleEdgePositionChange,
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

                {selectedData.uniqueTables.size === 1 && (
                    <>
                        <h3 className="text-lg font-semibold mt-3">Edge Position</h3>
                        <div className="flex flex-col gap-2">
                            <RadioBoxField
                                label="Left-Right"
                                name="edgePosition"
                                value="l-r"
                                model={state.values.edgePosition}
                                onChange={handleEdgePositionChange}
                            />
                            <RadioBoxField
                                label="Right-Left"
                                name="edgePosition"
                                value="r-l"
                                model={state.values.edgePosition}
                                onChange={handleEdgePositionChange}
                            />
                            <RadioBoxField
                                label="Right-Right"
                                name="edgePosition"
                                value="r-r"
                                model={state.values.edgePosition}
                                onChange={handleEdgePositionChange}
                            />
                            <RadioBoxField
                                label="Left-Left"
                                name="edgePosition"
                                value="l-l"
                                model={state.values.edgePosition}
                                onChange={handleEdgePositionChange}
                            />
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default memo(EdgeForm, (prev, next) => {
    if (
        prev.selectedData.primaryKeys.length !==
        next.selectedData.primaryKeys.length
    )
        return false;
    if (
        prev.selectedData.foreignKeys.length !==
        next.selectedData.foreignKeys.length
    )
        return false;

    for (let i = 0; i < next.selectedData.primaryKeys.length; i++) {
        const ppk = prev.selectedData.primaryKeys[i];
        const npk = next.selectedData.primaryKeys[i];
        if (
            ppk.column.name !== npk.column.name ||
            ppk.tableName !== npk.tableName ||
            ppk.column.isPrimaryKey !== npk.column.isPrimaryKey ||
            ppk.column.isForeignKey !== npk.column.isForeignKey ||
            ppk.column.type !== npk.column.type ||
            ppk.column.length !== npk.column.length ||
            ppk.column.precision !== npk.column.precision ||
            ppk.column.scale !== npk.column.scale
        ) {
            return false;
        }
    }

    for (let i = 0; i < next.selectedData.foreignKeys.length; i++) {
        const pfk = prev.selectedData.foreignKeys[i];
        const nfk = next.selectedData.foreignKeys[i];
        if (
            pfk.column.name !== nfk.column.name ||
            pfk.tableName !== nfk.tableName ||
            pfk.column.isPrimaryKey !== nfk.column.isPrimaryKey ||
            pfk.column.isForeignKey !== nfk.column.isForeignKey ||
            pfk.column.type !== nfk.column.type ||
            pfk.column.length !== nfk.column.length ||
            pfk.column.precision !== nfk.column.precision ||
            pfk.column.scale !== nfk.column.scale
        ) {
            return false;
        }
    }

    return (
        prev.selectedData.currentData.foreignKey ===
            next.selectedData.currentData.foreignKey &&
        prev.selectedData.currentData.reference ===
            next.selectedData.currentData.reference &&
        prev.selectedData.currentData.onDelete ===
            next.selectedData.currentData.onDelete &&
        prev.selectedData.currentData.onUpdate ===
            next.selectedData.currentData.onUpdate &&
        prev.selectedData.currentData.edgePosition ===
            next.selectedData.currentData.edgePosition
    );
});
