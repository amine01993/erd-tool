import { useMutation } from "@tanstack/react-query";
import { updateUserAttributes } from "@aws-amplify/auth";

const useUpdateUserAttribute = () => {
    return useMutation({
        mutationKey: ["update-user-attribute"],
        mutationFn: async ({
            attribute,
            value,
        }: {
            attribute: string;
            value: string;
        }) => {
            console.log("Updating user attribute api:", { attribute, value });
            const response = await updateUserAttributes({
                userAttributes: {
                    [attribute]: value,
                },
            });
            return response;
        },
    });
};

export default useUpdateUserAttribute;
