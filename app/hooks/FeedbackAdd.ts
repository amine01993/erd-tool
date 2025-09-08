import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/user";
import { FeedbackData } from "../type/FeedbackType";

const useAddFeedback = () => {
    const feedbackApiCall = useUserStore((state) => state.feedbackApiCall);

    return useMutation({
        mutationKey: ["add-feedback"],
        mutationFn: async (data: FeedbackData) => {
            console.log("Adding feedback api:", data);
            const response = await feedbackApiCall({
                body: data,
            });
        },
    });
};

export default useAddFeedback;
