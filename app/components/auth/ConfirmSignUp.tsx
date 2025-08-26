import { FormEvent, memo, useCallback, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import AlertCircleFilledIcon from "@iconify/icons-tabler/alert-circle-filled";
import useUserStore from "@/app/store/user";
import { validateCode } from "@/app/helper/auth-validation";
import ConfirmationInput from "./ConfirmationInput";

const ConfirmSignUp = ({ active }: { active: boolean }) => {
    const authDetail = useUserStore((state) => state.authDetail);
    const confirmSignUp = useUserStore((state) => state.confirmSignUp);
    const resendCode = useUserStore((state) => state.resendCode);

    const [serverError, setServerError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const codeRef = useRef("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (event: FormEvent) => {
            setSubmitted(true);
            event.preventDefault();

            if (loading) return;

            const validation = validateCode(codeRef.current);
            if (!validation.valid) {
                setError(validation.errors[0]);
                return;
            }

            try {
                setLoading(true);
                await confirmSignUp(codeRef.current);
                setServerError("");
            } catch (error: any) {
                setServerError(error.message || error.toString());
            } finally {
                setLoading(false);
            }
        },
        [loading]
    );

    const handleResend = useCallback(async () => {
        if (loading) return;
        try {
            setLoading(true);
            await resendCode();
            setServerError("");
        } catch (error: any) {
            setServerError(error.message || error.toString());
        } finally {
            setLoading(false);
        }
    }, [loading]);

    return (
        <form
            className={`flex-col gap-4 m-4 ${active ? "active" : ""}`}
            onSubmit={handleSubmit}
        >
            {authDetail?.codeDeliveryDetails?.destination && (
                <p className="confirmation-message">
                    A confirmation code has been sent to{" "}
                    <strong>
                        {authDetail.codeDeliveryDetails?.destination}
                    </strong>{" "}
                    via{" "}
                    <strong>
                        {authDetail.codeDeliveryDetails?.attributeName}
                    </strong>
                    .
                </p>
            )}

            {serverError && (
                <div className="server-error-message">
                    <Icon icon={AlertCircleFilledIcon} fontSize={21} />
                    {serverError}
                </div>
            )}

            <div className="form-group">
                <ConfirmationInput
                    length={6}
                    codeRef={codeRef}
                    id="user-confirmation-code"
                    required
                    submitted={submitted}
                    error={error}
                    setError={setError}
                />
            </div>

            <div className="mt-5" style={{ textAlign: "center" }}>
                Didn't get an email?&nbsp;&nbsp;&nbsp;
                <button className="link" onClick={handleResend}>
                    Resend
                </button>
            </div>

            <button type="submit" className="auth-btn">
                Confirm
            </button>
        </form>
    );
};

export default memo(ConfirmSignUp);
