import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/user";
import useDiagramStore from "../store/diagram";

const useDeleteDiagram = () => {
    const apiCall = useUserStore(state => state.apiCall);
    const startSyncing = useDiagramStore(state => state.startSyncing);
    const endSyncing = useDiagramStore(state => state.endSyncing);

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