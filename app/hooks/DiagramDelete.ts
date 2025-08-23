import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/user";
import useDiagramStore from "../store/diagram";

const useDeleteDiagram = () => {
    const { apiCall } = useUserStore();
    const { startSyncing, endSyncing } = useDiagramStore();

    return useMutation({
        mutationKey: ["delete-diagram"],
        mutationFn: async (id: string) => {
            console.log("Deleting diagram api:", id);
            startSyncing();
            const response = await apiCall({
                method: "DELETE",
                query: {
                    id,
                },
            });
            endSyncing();
        },
    });
};

export default useDeleteDiagram;