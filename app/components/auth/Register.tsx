import { memo, useCallback, useReducer } from "react";
import { Icon } from "@iconify/react";
import InputField from "../widgets/InputField";
import {
    initialRegisterState,
    registerReducer,
    useRegisterForm,
} from "@/app/hooks/RegisterForm";
import useUserStore from "@/app/store/user";

const Register = ({ active }: { active: boolean }) => {
    const { signup } = useUserStore();
    const [state, dispatch] = useReducer(registerReducer, initialRegisterState);
    const {
        handleEmailUpdate,
        handleFullNameUpdate,
        handlePasswordUpdate,
        handleConfirmPasswordUpdate,
        handleEmailBlur,
        handlePasswordBlur,
        handleConfirmPasswordBlur,
    } = useRegisterForm(dispatch);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const isValid =
                Object.values(state.errors).filter((err) => err !== undefined)
                    .length === 0;
            if (isValid) {
                try {
                    await signup(
                        state.values.email,
                        state.values.password,
                        state.values.fullName
                    );
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
                label="Full Name"
                value={state.values.fullName}
                onChange={handleFullNameUpdate}
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
            <InputField
                label="Confirm Password"
                type="password"
                required
                value={state.values.confirmPassword}
                error={state.errors.confirmPassword}
                touched={state.touched.confirmPassword}
                onChange={handleConfirmPasswordUpdate}
                onBlur={handleConfirmPasswordBlur}
            />
            <button type="submit" className="auth-btn">
                Register
            </button>
        </form>
    );
};

export default memo(Register);
