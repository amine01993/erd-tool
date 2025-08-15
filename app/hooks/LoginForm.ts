import { ActionDispatch, ChangeEvent, useCallback } from "react";
import { validateEmail, validatePassword } from "../helper/auth-validation";

export function useLoginForm(dispatch: ActionDispatch<[action: LoginAction]>) {
    const handleEmailUpdate = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            dispatch({ type: "SET_EMAIL", payload: e.target.value });
        },
        []
    );
    const handlePasswordUpdate = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            dispatch({ type: "SET_PASSWORD", payload: e.target.value });
        },
        []
    );

    const handleEmailBlur = useCallback(() => {
        dispatch({ type: "SET_TOUCHED", payload: "email" });
    }, []);
    const handlePasswordBlur = useCallback(() => {
        dispatch({ type: "SET_TOUCHED", payload: "password" });
    }, []);

    return {
        handleEmailUpdate,
        handlePasswordUpdate,
        handleEmailBlur,
        handlePasswordBlur,
    };
}

interface LoginState {
    values: {
        email: string;
        password: string;
    };
    touched: {
        email: boolean;
        password: boolean;
    };
    errors: {
        email: string | undefined;
        password: string | undefined;
    };
    serverError: string;
}

type LoginAction =
    | {
          type: "SET_EMAIL" | "SET_PASSWORD";
          payload: string;
      }
    | {
          type: "SET_TOUCHED";
          payload: "email" | "password";
      }
    | { type: "SUBMITTED" }
    | { type: "SET_SERVER_ERROR"; payload: string };

export const initialLoginState: LoginState = {
    values: {
        email: "",
        password: "",
    },
    touched: {
        email: false,
        password: false,
    },
    errors: {
        email: undefined,
        password: undefined,
    },
    serverError: "",
};

export const loginReducer = (
    state: LoginState,
    action: LoginAction
): LoginState => {
    switch (action.type) {
        case "SET_EMAIL":
            const emailErrors = validateEmail(action.payload);
            return {
                ...state,
                values: { ...state.values, email: action.payload },
                errors: {
                    ...state.errors,
                    email: emailErrors.valid
                        ? undefined
                        : emailErrors.errors[0],
                },
            };
        case "SET_PASSWORD":
            const passwordErrors = validatePassword(action.payload, false);
            const newPasswordState = {
                ...state,
                values: { ...state.values, password: action.payload },
                errors: {
                    ...state.errors,
                    password: passwordErrors.valid
                        ? undefined
                        : passwordErrors.errors[0],
                },
            };
            return newPasswordState;
        case "SET_TOUCHED":
            return {
                ...state,
                touched: { ...state.touched, [action.payload]: true },
            };
        case "SUBMITTED":
            return {
                ...state,
                touched: { email: true, password: true },
            };
        case "SET_SERVER_ERROR":
            return {
                ...state,
                serverError: action.payload,
            };
        default:
            return state;
    }
};
