import { ActionDispatch, ChangeEvent, useCallback, useMemo } from "react";
import { validateName } from "../helper/validation";
import { EntityFormAction, EntityFormState } from "../type/EntityFormType";
import useErdStore from "../store/erd";

export function useEntityForm(
    dispatch: ActionDispatch<[action: EntityFormAction]>
) {
    const selectedNodeId = useErdStore(state => state.selectedNodeId);
    const nodes = useErdStore(state => state.nodes);

    const entityNames = useMemo(() => {
        return new Set(
            nodes
                .filter((node) => node.id !== selectedNodeId)
                .map((node) => node.data.name)
        );
    }, [selectedNodeId, nodes]);

    const handleNameChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            dispatch({
                type: "SET_FIELD",
                value: e.target.value,
                entityNames,
            });
        },
        [entityNames]
    );

    const handleNameBlur = useCallback(() => {
        dispatch({ type: "SET_TOUCHED" });
    }, []);

    return {
        handleNameChange,
        handleNameBlur,
    };
}

export const initialEntityState: EntityFormState = {
    value: "",
    error: undefined,
    touched: false,
    isValid: false,
};

export const entityFormReducer = (
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
