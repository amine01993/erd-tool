import { memo, MouseEvent, ReactNode, useCallback, useEffect } from "react";
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

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (isOpen) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    handleClose();
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div
            className={cc(["modal-container", { open: isOpen }])}
            onClick={handleClose}
        >
            <div className="modal-content" onClick={stopPropagation}>
                {children}
            </div>
        </div>
    );
};

export default memo(Modal);
