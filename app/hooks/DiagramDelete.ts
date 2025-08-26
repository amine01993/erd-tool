import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/user";
import useDiagramStore from "../store/diagram";

const useDeleteDiagram = () => {
    const apiCall = useUserStore((state) => state.apiCall);
    const startSyncing = useDiagramStore((state) => state.startSyncing);
    const endSyncing = useDiagramStore((state) => state.endSyncing);

    return useMutation({
        mutationKey: ["delete-diagram"],
        mutationFn: async (options: {id: string; perma?: boolean}) => {
            const { id, perma } = options;
            console.log("Deleting diagram api:", id);
            startSyncing();
            const query: Record<string, string> = { id };
            if (perma) {
                query["perma"] = "1";
            }
            const response = await apiCall({
                method: "DELETE",
                query,
            });
            endSyncing();
        },
    });
};

export default useDeleteDiagram;
