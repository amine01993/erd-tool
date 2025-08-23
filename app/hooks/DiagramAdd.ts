import { useMutation } from "@tanstack/react-query";
import useUserStore from "../store/user";
import useDiagramStore from "../store/diagram";
import { DiagramData } from "../type/DiagramType";

const useAddDiagram = () => {
    const { apiCall } = useUserStore();
    const { startSyncing, endSyncing } = useDiagramStore();

    return useMutation({
        mutationKey: ["add-diagram"],
        mutationFn: async (data: DiagramData) => {
            console.log("Adding diagram api:", data);
            startSyncing();
            const response = await apiCall({
                method: "POST",
                body: data,
            });
            endSyncing();
        },
    });
};

export default useAddDiagram;
