import { FormEvent, memo, useCallback, useReducer } from "react";
import { Icon } from "@iconify/react";
import InputField from "../widgets/InputField";
import {
    initialLoginState,
    loginReducer,
    useLoginForm,
} from "@/app/hooks/LoginForm";
import useUserStore from "@/app/store/user";

const Login = ({ active }: { active: boolean }) => {
    const { login } = useUserStore();
    const [state, dispatch] = useReducer(loginReducer, initialLoginState);
    const {
        handleEmailUpdate,
        handlePasswordUpdate,
        handleEmailBlur,
        handlePasswordBlur,
    } = useLoginForm(dispatch);

    const handleSubmit = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();

            const isValid =
                Object.values(state.errors).filter((err) => err !== undefined)
                    .length === 0;
            if (isValid) {
                try {
                    await login(state.values.email, state.values.password);
                    dispatch({
                        type: "SET_SERVER_ERROR",
                        payload: "",
                    });
                } catch (error: any) {
                    dispatch({
                        type: "SET_SERVER_ERROR",
                        payload: error.toString(),
                    });
                }
            }
        },
        [state]
    );

    return (
        <form
            className={`flex-col gap-4 m-4 ${active ? "active" : ""}`}
            onSubmit={handleSubmit}
        >
            {state.serverError && (
                <div className="server-error-message">
                    <Icon icon="tabler:alert-circle-filled" fontSize={21} />
                    {state.serverError}
                </div>
            )}

            <InputField
                label="Email"
                type="email"
                required
                value={state.values.email}
                error={state.errors.email}
                touched={state.touched.email}
                onChange={handleEmailUpdate}
                onBlur={handleEmailBlur}
            />
            <InputField
                label="Password"
                type="password"
                required
                value={state.values.password}
                error={state.errors.password}
                touched={state.touched.password}
                onChange={handlePasswordUpdate}
                onBlur={handlePasswordBlur}
            />
            <button type="submit" className="auth-btn">
                Login
            </button>
        </form>
    );
};

export default memo(Login);
