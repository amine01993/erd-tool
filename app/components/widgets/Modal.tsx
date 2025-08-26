import { memo, MouseEvent, ReactNode, useCallback } from "react";
import cc from "classcat";

interface ModalProps {
    isOpen: boolean;
    children?: ReactNode;
    handleClose: () => void;
}

const Modal = ({ isOpen, children, handleClose }: ModalProps) => {

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
