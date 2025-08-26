import { memo, useCallback } from "react";
import useUserStore from "@/app/store/user";
import Modal from "../widgets/Modal";
import Register from "./Register";
import Login from "./Login";
import ConfirmSignUp from "./ConfirmSignUp";

const Authentication = () => {
    const isAuthModalOpen = useUserStore((state) => state.isAuthModalOpen);
    const authType = useUserStore((state) => state.authType);
    const setAuthType = useUserStore((state) => state.setAuthType);
    const closeAuthModal = useUserStore((state) => state.closeAuthModal);

    const handleClose = useCallback(() => {
        closeAuthModal();
    }, [closeAuthModal]);
    
    return (
        <Modal isOpen={isAuthModalOpen} handleClose={handleClose}>
            <ul className="auth-header">
                <li className={authType === "login" ? "active" : ""}>
                    <button onClick={() => setAuthType("login")}>
                        Sign In
                    </button>
                </li>
                <li
                    className={
                        ["register", "confirmSignUp"].includes(authType)
                            ? "active"
                            : ""
                    }
                >
                    <button onClick={() => setAuthType("register")}>
                        Create Account
                    </button>
                </li>
            </ul>
            <div className="auth-body">
                <Login active={authType === "login"} />
                <Register active={authType === "register"} />
                <ConfirmSignUp active={authType === "confirm_sign_up"} />
            </div>
        </Modal>
    );
};

export default memo(Authentication);
