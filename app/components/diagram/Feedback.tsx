import {
    FormEvent,
    memo,
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState,
} from "react";
import { Icon } from "@iconify/react";
import XIcon from "@iconify/icons-tabler/x";
import { nanoid } from "nanoid";
import useUserStore from "@/app/store/user";
import useAlertStore from "@/app/store/alert";
import Modal from "../widgets/Modal";
import useFeedbackForm, {
    feedbackFormReducer,
    initialFeedbackFormState,
} from "@/app/hooks/FeedbackForm";
import InputField from "../widgets/InputField";
import TextAreaField from "../widgets/TextAreaField";
import useAddFeedback from "@/app/hooks/FeedbackAdd";

const Feedback = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [state, dispatch] = useReducer(
        feedbackFormReducer,
        initialFeedbackFormState
    );
    const {
        isValid,
        handleNameChange,
        handleEmailChange,
        handleMessageChange,
        handleNameBlur,
        handleEmailBlur,
        handleMessageBlur,
    } = useFeedbackForm(state, dispatch);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isFeedbackModalOpen = useUserStore(
        (state) => state.isFeedbackModalOpen
    );
    const authData = useUserStore((state) => state.authData);
    const feedbackApiCall = useUserStore((state) => state.feedbackApiCall);
    const closeFeedbackModal = useUserStore(
        (state) => state.closeFeedbackModal
    );
    const showToast = useAlertStore((state) => state.showToast);
    const mutationAddFeedback = useAddFeedback();

    const handleClose = useCallback(() => {
        closeFeedbackModal();
    }, []);

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!isValid) {
                return;
            }

            if (isSubmitting) return;
            setIsSubmitting(true);
            dispatch({ type: "SET_SUBMITTED" });

            mutationAddFeedback.mutate(
                {
                    id: nanoid(),
                    name: state.values.name.trim(),
                    email: state.values.email.trim(),
                    message: state.values.message.trim(),
                },
                {
                    onSuccess(data, variables, context) {
                        closeFeedbackModal();
                        showToast("Thank you for your feedback!", "success");
                    },
                    onError(error, variables, context) {
                        showToast(
                            "Failed to send feedback. Please try again later.",
                            "error"
                        );
                    },
                    onSettled(data, error, variables, context) {
                        setIsSubmitting(false);
                    },
                }
            );
        },
        [
            isValid,
            isSubmitting,
            state.values,
            feedbackApiCall,
            showToast,
            closeFeedbackModal,
        ]
    );

    useEffect(() => {
        if (isFeedbackModalOpen) {
            dispatch({
                type: "SET_VALUE",
                field: "email",
                value: authData.email,
            });
            dispatch({
                type: "SET_VALUE",
                field: "name",
                value: authData.name,
            });
            textareaRef.current?.focus();
        }
    }, [isFeedbackModalOpen, authData]);

    return (
        <Modal isOpen={isFeedbackModalOpen} handleClose={handleClose}>
            <div className="flex flex-col items-center gap-4 p-4 mt-9">
                <h1 className="text-xl font-semibold">
                    We’d love to hear your thoughts!
                </h1>
                <form
                    className="contents feedback-form"
                    onSubmit={handleSubmit}
                >
                    <InputField
                        label="Email"
                        type="email"
                        value={state.values.email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        error={state.errors.email}
                        touched={state.touched.email}
                        required
                    />
                    <InputField
                        label="Name"
                        value={state.values.name}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                    />
                    <TextAreaField
                        label="Message"
                        value={state.values.message}
                        onChange={handleMessageChange}
                        onBlur={handleMessageBlur}
                        error={state.errors.message}
                        required
                        rows={7}
                        ref={textareaRef}
                    />

                    <div className="action-btns justify-between! mt-0!">
                        <button className="cancel-btn" onClick={handleClose}>
                            Cancel
                        </button>
                        <button
                            className="confirm-btn"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send Feedback"}
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

export default memo(Feedback);
