import { ActionDispatch, ChangeEvent, useCallback, useMemo } from "react";
import useErdStore from "../store/erd";
import { EdgeInfoData } from "../components/erd/EdgeInfo";
import { EdgeFormAction, EdgeFormState } from "../type/EdgeFormType";

export function useEdgeForm(
    selectedData: EdgeInfoData,
    state: EdgeFormState,
    dispatch: ActionDispatch<[action: EdgeFormAction]>
) {
    const handleForeignKeyConstraint = useErdStore(
        (state) => state.handleForeignKeyConstraint
    );

    const foreignKeyOptions = useMemo(() => {
        const options = selectedData.foreignKeys.map((fk) => {
            let type = fk.column.type;
            if (type === "numeric")
                type += `(${fk.column.precision || 38}, ${
                    fk.column.scale || 0
                })`;
            if (type === "string") type += `(${fk.column.length || 255})`;
            return {
                value: fk.tableName + "." + fk.column.name,
                label: `${fk.column.name}: ${type} (in ${fk.tableName})`,
            };
        });
        options.unshift({
            value: "",
            label: "Select a foreign key",
        });
        return options;
    }, [selectedData]);

    const primaryKeyOptions = useMemo(() => {
        const options = selectedData.primaryKeys.map((fk) => {
            let type = fk.column.type;
            if (type === "numeric")
                type += `(${fk.column.precision || 38}, ${
                    fk.column.scale || 0
                })`;
            if (type === "string") type += `(${fk.column.length || 255})`;
            return {
                value: fk.tableName + "." + fk.column.name,
                label: `${fk.column.name}: ${type} (in ${fk.tableName})`,
            };
        });
        options.unshift({
            value: "",
            label: "Select a primary key",
        });
        return options;
    }, [selectedData]);

    const cascadeOptions = useMemo(() => {
        return ["RESTRICT", "CASCADE", "SET NULL"].map((option) => ({
            value: option,
            label: option,
        }));
    }, []);

    const handleSelectField = useCallback(
        (field: keyof EdgeFormState["values"]) => {
            return (event: ChangeEvent<HTMLSelectElement>) => {
                dispatch({
                    type: "SET_FIELD",
                    field,
                    value: event.target.value,
                });

                const values = { ...state.values, [field]: event.target.value };
                if (field === "foreignKey") {
                    values.oldForeignKey = state.values.foreignKey;
                }
                handleForeignKeyConstraint(
                    values.oldForeignKey,
                    values.foreignKey,
                    values.reference,
                    values.onDelete,
                    values.onUpdate
                );
            };
        },
        [state.values, handleForeignKeyConstraint]
    );

    const handleForeignKeyChange = useCallback(
        handleSelectField("foreignKey"),
        [handleSelectField]
    );
    const handleReferenceChange = useCallback(handleSelectField("reference"), [
        handleSelectField,
    ]);
    const handleOnDeleteChange = useCallback(handleSelectField("onDelete"), [
        handleSelectField,
    ]);
    const handleOnUpdateChange = useCallback(handleSelectField("onUpdate"), [
        handleSelectField,
    ]);

    return {
        foreignKeyOptions,
        primaryKeyOptions,
        cascadeOptions,
        handleForeignKeyChange,
        handleReferenceChange,
        handleOnDeleteChange,
        handleOnUpdateChange,
    };
}

export const initialEdgeFormState: EdgeFormState = {
    values: {
        oldForeignKey: "",
        foreignKey: "",
        reference: "",
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    },
};

export const edgeFormReducer = (
    state: EdgeFormState,
    action: EdgeFormAction
): EdgeFormState => {
    switch (action.type) {
        case "SET_VALUES": {
            const newValues = {
                ...state,
                values: {
                    ...state.values,
                    ...action.values,
                },
            };
            return newValues;
        }
        case "SET_FIELD": {
            let values = { ...state.values, [action.field]: action.value };
            if (action.field === "foreignKey") {
                values.oldForeignKey = state.values.foreignKey;
            }
            return {
                ...state,
                values: { ...state.values, [action.field]: action.value },
            };
        }
        default:
            return state;
    }
};
