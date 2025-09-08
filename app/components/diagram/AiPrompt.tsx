import {
    ChangeEvent,
    FormEvent,
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Icon } from "@iconify/react";
import XIcon from "@iconify/icons-tabler/x";
import useUserStore from "@/app/store/user";
import Modal from "../widgets/Modal";
import { erdSchema } from "@/app/erd-suggestion/schema";
import cc from "classcat";
import { useReactFlow } from "@xyflow/react";
import useErdStore from "@/app/store/erd";
import useAlertStore from "@/app/store/alert";
import { ErdSchema } from "@/app/type/EntityType";

const AiPrompt = () => {
    const { fitView } = useReactFlow();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isAiPromptOpen = useUserStore((state) => state.isAiPromptOpen);
    const closeAiPrompt = useUserStore((state) => state.closeAiPrompt);
    const setErdFromSchema = useErdStore((state) => state.setErdFromSchema);
    const showToast = useAlertStore((state) => state.showToast);
    const { isLoading, object, submit, stop } = useObject({
        api: "/erd-suggestion",
        schema: erdSchema,
        onFinish({ object, error }) {
            console.log("Schema validation error:", error);
            if (error) {
                showToast(error.message, "error");
            }
            setPrompt("");
            closeAiPrompt();
        },
        onError(error) {
            // error during fetch request:
            console.error("An error occurred:", error);
            if (error) {
                showToast(error.message, "error");
            }
        },
    });
    const [prompt, setPrompt] = useState("");

    const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    }, []);

    const handleClose = useCallback(() => {
        closeAiPrompt();
    }, []);

    const handleStop = useCallback(() => {
        if (isLoading) {
            stop();
        }
    }, [isLoading]);

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (isLoading) return;
            submit(prompt);
        },
        [isLoading, prompt]
    );

    useEffect(() => {
        if (isAiPromptOpen) {
            textareaRef.current?.focus();
        }
    }, [isAiPromptOpen]);

    useEffect(() => {
        if (object) {
            setErdFromSchema({
                nodes: [],
                edges: [],
                ...object,
            } as ErdSchema).then(() => {
                fitView({ padding: 0.1 });
            });
        }
    }, [object]);

    return (
        <Modal isOpen={isAiPromptOpen} handleClose={handleClose}>
            <div className="flex flex-col items-center gap-4 p-4 mt-9">
                <form className="contents" onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Describe your diagram..."
                        className="w-full bg-white outline-2 outline-white p-2 rounded-md focus:outline-[#640D14] transition-colors duration-200"
                        rows={3}
                        ref={textareaRef}
                        value={prompt}
                        onChange={handleChange}
                        required
                    ></textarea>

                    <div className="action-btns justify-between! mt-0!">
                        <button
                            className={cc([
                                "cancel-btn",
                                { invisible: !isLoading },
                            ])}
                            onClick={handleStop}
                        >
                            Stop
                        </button>
                        <button className="confirm-btn" disabled={isLoading}>
                            {isLoading ? "Loading..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
            <button className="close-modal" onClick={handleClose}>
                <Icon icon={XIcon} width={20} height={20} />
            </button>
        </Modal>
    );
};

export default memo(AiPrompt);
