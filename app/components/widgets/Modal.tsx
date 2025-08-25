import { memo, MouseEvent, ReactNode, useCallback } from "react";
import cc from "classcat";
import useUserStore from "@/app/store/user";

interface ModalProps {
    isOpen: boolean;
    children?: ReactNode;
}

const Modal = ({ isOpen, children }: ModalProps) => {
    const closeAuthModal = useUserStore(state => state.closeAuthModal);

    const handleClose = useCallback(() => {
        closeAuthModal();
    }, [closeAuthModal]);

    const stopPropagation = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }, []);

    return (
        <div
            className={cc([
                "modal-container",
                { open: isOpen },
            ])}
            onClick={handleClose}
        >
            <div
                className="modal-content"
                onClick={stopPropagation}
            >
                {children}
            </div>
        </div>
    );
};

export default memo(Modal);
