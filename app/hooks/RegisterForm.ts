import { ActionDispatch, ChangeEvent, useCallback } from "react";
import {
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
} from "../helper/auth-validation";

export function useRegisterForm(
    dispatch: ActionDispatch<[action: RegisterAction]>
) {
    const handleEmailUpdate = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            dispatch({ type: "SET_EMAIL", payload: e.target.value });
        },
        []
    );
    const handleFullNameUpdate = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            dispatch({ type: "SET_FULL_NAME", payload: e.target.value });
        },
        []
    );
    const handlePasswordUpdate = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            dispatch({ type: "SET_PASSWORD", payload: e.target.value });
        },
        []
    );
    const handleConfirmPasswordUpdate = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            dispatch({ type: "SET_CONFIRM_PASSWORD", payload: e.target.value });
        },
        []
    );

    const handleEmailBlur = useCallback(() => {
        dispatch({ type: "SET_TOUCHED", payload: "email" });
    }, []);
    const handlePasswordBlur = useCallback(() => {
        dispatch({ type: "SET_TOUCHED", payload: "password" });
    }, []);
    const handleConfirmPasswordBlur = useCallback(() => {
        dispatch({ type: "SET_TOUCHED", payload: "confirmPassword" });
    }, []);

    return {
        handleEmailUpdate,
        handleFullNameUpdate,
        handlePasswordUpdate,
        handleConfirmPasswordUpdate,
        handleEmailBlur,
        handlePasswordBlur,
        handleConfirmPasswordBlur,
    };
}

interface RegisterState {
    values: {
        email: string;
        fullName: string;
        password: string;
        confirmPassword: string;
    };
    touched: {
        email: boolean;
        password: boolean;
        confirmPassword: boolean;
    };
    errors: {
        email: string | undefined;
        password: string | undefined;
        confirmPassword: string | undefined;
    };
    serverError: string;
}

type RegisterAction =
    | {
          type:
              | "SET_EMAIL"
              | "SET_FULL_NAME"
              | "SET_PASSWORD"
              | "SET_CONFIRM_PASSWORD";
          payload: string;
      }
    | {
          type: "SET_TOUCHED";
          payload: "email" | "password" | "confirmPassword";
      }
    | {
          type: "SUBMITTED";
      }
    | {
          type: "SET_SERVER_ERROR";
          payload: string;
      };

export const initialRegisterState: RegisterState = {
    values: {
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
    },
    touched: {
        email: false,
        password: false,
        confirmPassword: false,
    },
    errors: {
        email: undefined,
        password: undefined,
        confirmPassword: undefined,
    },
    serverError: "",
};

export const registerReducer = (
    state: RegisterState,
    action: RegisterAction
): RegisterState => {
    let confirmPasswordErrors;
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
        case "SET_FULL_NAME":
            return {
                ...state,
                values: { ...state.values, fullName: action.payload },
            };
        case "SET_PASSWORD":
            const passwordErrors = validatePassword(action.payload);
            confirmPasswordErrors = validatePasswordConfirmation(
                action.payload,
                state.values.confirmPassword
            );
            const newPasswordState = {
                ...state,
                values: { ...state.values, password: action.payload },
                errors: {
                    ...state.errors,
                    password: passwordErrors.valid
                        ? undefined
                        : passwordErrors.errors[0],
                    confirmPassword: confirmPasswordErrors.valid
                        ? undefined
                        : confirmPasswordErrors.errors[0],
                },
            };
            return newPasswordState;
        case "SET_CONFIRM_PASSWORD":
            confirmPasswordErrors = validatePasswordConfirmation(
                state.values.password,
                action.payload
            );
            return {
                ...state,
                values: { ...state.values, confirmPassword: action.payload },
                errors: {
                    ...state.errors,
                    confirmPassword: confirmPasswordErrors.valid
                        ? undefined
                        : confirmPasswordErrors.errors[0],
                },
            };
        case "SET_TOUCHED":
            return {
                ...state,
                touched: { ...state.touched, [action.payload]: true },
            };
        case "SUBMITTED":
            return {
                ...state,
                touched: { email: true, password: true, confirmPassword: true },
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
