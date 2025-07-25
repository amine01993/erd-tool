
import {create} from "zustand";

export interface DiagramData {
    id: string;
    name: string;
    createAt: string;
    lastUpdate: string;
}

export const mockDiagrams: DiagramData[] = [
    {
        id: "1",
        name: "Sample Diagram",
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Another Diagram",
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
    },
    {
        id: "3",
        name: "Third Diagram",
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
    },
];

const useDiagramStore = create<{
    diagrams: DiagramData[];
}>()((set) => ({
    diagrams: mockDiagrams,
}));

export default useDiagramStore;
