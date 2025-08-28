import { memo, useCallback, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import CloudIcon from "@iconify/icons-tabler/cloud";
import XIcon from "@iconify/icons-tabler/x";
import useUserStore from "@/app/store/user";
import useDiagramStore, { currentDiagramSelector } from "@/app/store/diagram";
import Modal from "../widgets/Modal";
import useRecoverDiagram from "@/app/hooks/DiagramRecover";

const ReadOnlyMode = () => {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const isReadOnlyModalOpen = useUserStore(
        (state) => state.isReadOnlyModalOpen
    );
    const closeReadOnlyModal = useUserStore(
        (state) => state.closeReadOnlyModal
    );
    const currentDiagram = useDiagramStore(currentDiagramSelector);
    const recoverDiagram = useDiagramStore((state) => state.recoverDiagram);
    const mutationRecover = useRecoverDiagram();

    const handleClose = useCallback(() => {
        closeReadOnlyModal();
    }, [closeReadOnlyModal]);

    const handleRecovery = useCallback(() => {
        recoverDiagram(mutationRecover);
        closeReadOnlyModal();
    }, [recoverDiagram, closeReadOnlyModal]);

    useEffect(() => {
        if (isReadOnlyModalOpen) {
            cancelButtonRef.current?.focus();
        }
    }, [isReadOnlyModalOpen]);

    return (
        <Modal isOpen={isReadOnlyModalOpen} handleClose={handleClose}>
            <div className="flex flex-col items-center gap-4 p-4">
                <Icon
                    icon={CloudIcon}
                    width={200}
                    height={200}
                    className="-mb-4"
                />
                <h1 className="text-xl font-semibold">
                    Recently deleted diagrams can’t be edited.
                </h1>
                <p className="text-center">
                    To edit this diagram "{currentDiagram?.name}", you’ll need
                    to recover it.
                </p>

                <div className="action-btns">
                    <button
                        className="cancel-btn"
                        ref={cancelButtonRef}
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button className="confirm-btn" onClick={handleRecovery}>
                        Recover
                    </button>
                </div>
            </div>
            <button className="close-modal" onClick={handleClose}>
                <Icon icon={XIcon} width={20} height={20} />
            </button>
        </Modal>
    );
};

export default memo(ReadOnlyMode);
