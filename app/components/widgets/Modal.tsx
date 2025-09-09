import { memo, MouseEvent, ReactNode, useCallback, useEffect, useMemo } from "react";
import cc from "classcat";

interface ModalProps {
    isOpen: boolean;
    className?: string;
    children?: ReactNode;
    handleClose: () => void;
}

const Modal = ({ isOpen, children, handleClose, className }: ModalProps) => {
    const stopPropagation = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }, []);

    const modalClasses = useMemo(() => {
        return cc(["modal-container", { open: isOpen }]);
    }, [isOpen]);
    const modalContentClasses = useMemo(() => {
        return cc(["modal-content", className]);
    }, [className]);

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
            className={modalClasses}
            onClick={handleClose}
        >
            <div className={modalContentClasses} onClick={stopPropagation}>
                {children}
            </div>
        </div>
    );
};

export default memo(Modal);
