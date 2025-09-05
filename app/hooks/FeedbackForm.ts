import { ChangeEvent, Dispatch, useCallback, useEffect, useMemo } from "react";
import { validateEmail } from "../helper/auth-validation";

const useFeedbackForm = (
    state: FeedbackFormState,
    dispatch: Dispatch<FeedbackFormAction>
) => {
    const isValid = useMemo(() => {
        const errorCount = Object.values(state.errors).filter(Boolean).length;
        return errorCount === 0;
    }, [state.errors]);

    const handleNameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            dispatch({
                type: "SET_VALUE",
                field: "name",
                value: event.target.value,
            });
        },
        []
    );
    const handleEmailChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            dispatch({
                type: "SET_VALUE",
                field: "email",
                value: event.target.value,
            });
        },
        []
    );
    const handleMessageChange = useCallback(
        (event: ChangeEvent<HTMLTextAreaElement>) => {
            dispatch({
                type: "SET_VALUE",
                field: "message",
                value: event.target.value,
            });
        },
        []
    );

    const handleBlur = (field: string) => () => {
        dispatch({ type: "SET_TOUCHED", field });
    };

    const handleNameBlur = useCallback(handleBlur("name"), []);
    const handleEmailBlur = useCallback(handleBlur("email"), []);
    const handleMessageBlur = useCallback(handleBlur("message"), []);

    useEffect(() => {
        const validation = validateEmail(state.values.email.trim());
        dispatch({
            type: "SET_ERROR",
            field: "email",
            value: validation.valid ? "" : validation.errors[0],
        });
    }, [state.values.email]);

    useEffect(() => {
        dispatch({
            type: "SET_ERROR",
            field: "message",
            value: state.values.message.trim() ? "" : "Message cannot be empty",
        });
    }, [state.values.message]);

    return {
        isValid,
        handleNameChange,
        handleEmailChange,
        handleMessageChange,
        handleNameBlur,
        handleEmailBlur,
        handleMessageBlur,
    };
};

export default useFeedbackForm;

interface FeedbackFormState {
    values: {
        name: string;
        email: string;
        message: string;
    };
    errors: {
        email?: string;
        message?: string;
    };
    touched: {
        email: boolean;
        message: boolean;
    };
}

export const initialFeedbackFormState: FeedbackFormState = {
    values: {
        name: "",
        email: "",
        message: "",
    },
    errors: {
        email: "Email cannot be empty",
        message: "Message cannot be empty",
    },
    touched: {
        email: false,
        message: false,
    },
};

type FeedbackFormAction =
    | { type: "SET_VALUE"; field: string; value: string }
    | { type: "SET_ERROR"; field: string; value: string }
    | { type: "SET_TOUCHED"; field: string }
    | { type: "SET_SUBMITTED" };

export const feedbackFormReducer = (
    state: FeedbackFormState,
    action: FeedbackFormAction
): FeedbackFormState => {
    switch (action.type) {
        case "SET_VALUE":
            return {
                ...state,
                values: {
                    ...state.values,
                    [action.field]: action.value,
                },
            };
        case "SET_ERROR":
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.field]: action.value,
                },
            };
        case "SET_TOUCHED":
            return {
                ...state,
                touched: {
                    ...state.touched,
                    [action.field]: true,
                },
            };
        case "SET_SUBMITTED":
            return {
                ...state,
                touched: {
                    email: true,
                    message: true,
                },
            };
        default:
            return state;
    }
};
