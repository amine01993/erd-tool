import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/user";
import useDiagramStore from "../store/diagram";

const useRecoverDiagram = () => {
    const apiCall = useUserStore(state => state.apiCall);
    const startSyncing = useDiagramStore(state => state.startSyncing);
    const endSyncing = useDiagramStore(state => state.endSyncing);

    return useMutation({
        mutationKey: ["recover-diagram"],
        mutationFn: async (id: string) => {
            console.log("Recover diagram:", id);
            startSyncing();
            const response = await apiCall({
                method: "PUT",
                query: { id, recover: "1" },
            });
            endSyncing();
        },
    });
};

export default useRecoverDiagram;
