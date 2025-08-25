import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/user";
import useDiagramStore from "../store/diagram";
import { DiagramDataUpdate } from "../type/DiagramType";

const useUpdateDiagram = () => {
    const apiCall = useUserStore(state => state.apiCall);
    const startSyncing = useDiagramStore(state => state.startSyncing);
    const endSyncing = useDiagramStore(state => state.endSyncing);

    return useMutation({
        mutationKey: ["update-diagram"],
        mutationFn: async (data: DiagramDataUpdate) => {
            console.log("Updated diagram update data:", data);
            startSyncing();
            const response = await apiCall({
                method: "PUT",
                body: data,
            });
            endSyncing();
        },
    });
};

export default useUpdateDiagram;
