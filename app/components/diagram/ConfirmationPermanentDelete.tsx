import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import CloudIcon from "@iconify/icons-tabler/cloud";
import XIcon from "@iconify/icons-tabler/x";
import useUserStore from "@/app/store/user";
import useDiagramStore, { currentDiagramSelector } from "@/app/store/diagram";
import Modal from "../widgets/Modal";
import useDeleteDiagram from "@/app/hooks/DiagramDelete";

const ConfirmationPermanentDelete = () => {
    const isConfirmModalOpen = useUserStore(
        (state) => state.isConfirmModalOpen
    );
    const closeConfirmModal = useUserStore((state) => state.closeConfirmModal);
    const currentDiagram = useDiagramStore(currentDiagramSelector);
    const deleteDiagramPermanently = useDiagramStore(
        (state) => state.deleteDiagramPermanently
    );
    const mutationDelete = useDeleteDiagram();

    const handleClose = useCallback(() => {
        closeConfirmModal();
    }, [closeConfirmModal]);

    const handleConfirm = useCallback(() => {
        deleteDiagramPermanently(mutationDelete);
        closeConfirmModal()
    }, [deleteDiagramPermanently, currentDiagram, mutationDelete.isPending]);

    return (
        <Modal isOpen={isConfirmModalOpen} handleClose={handleClose}>
            <div className="flex flex-col items-center gap-4 p-4">
                <Icon
                    icon={CloudIcon}
                    width={200}
                    height={200}
                    className="-mb-4"
                />
                <h1 className="text-xl font-semibold">
                    Delete Items Cannot Be Recovered
                </h1>
                <p className="text-center">
                    Are you sure you want to permanently delete this diagram "
                    {currentDiagram?.name}"?
                </p>

                <div className="action-btns">
                    <button
                        className="cancel-btn"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="confirm-btn"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
            <button className="close-modal" onClick={handleClose}>
                <Icon icon={XIcon} width={20} height={20} />
            </button>
        </Modal>
    );
};

export default memo(ConfirmationPermanentDelete);
