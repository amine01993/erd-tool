import { create } from "zustand";
import { Node, Edge, Viewport } from "@xyflow/react";
import { nanoid } from "nanoid";
import { DiagramData } from "../type/DiagramType";
import { ErdEdgeData } from "../type/EdgeType";
import { EntityData } from "../type/EntityType";

export const mockDiagrams: DiagramData[] = [
    {
        id: "1",
        name: "Sample Diagram",
        nodes: [
            {
                id: "1",
                data: {
                    name: "Node_1",
                    attributes: [
                        { id: nanoid(5), name: "Attribute_1", type: "string" },
                        { id: nanoid(5), name: "Attribute_2", type: "integer" },
                        { id: nanoid(5), name: "Attribute_3", type: "boolean" },
                    ],
                },
                position: { x: 0, y: 0 },
                type: "entity",
            },
            {
                id: "2",
                data: {
                    name: "Node_2",
                    attributes: [
                        { id: nanoid(5), name: "Attribute_4", type: "string" },
                        { id: nanoid(5), name: "Attribute_5", type: "integer" },
                    ],
                },
                position: { x: -200, y: 200 },
                type: "entity",
            },
            {
                id: "3",
                data: {
                    name: "Node_3",
                    attributes: [
                        { id: nanoid(5), name: "Attribute_6", type: "string" },
                        { id: nanoid(5), name: "Attribute_7", type: "integer" },
                    ],
                },
                position: { x: 150, y: 300 },
                type: "entity",
            },
        ],
        edges: [
            {
                id: "1->2",
                source: "1",
                target: "2",
                markerStart: "edge-zero-marker-start",
                markerEnd: "edge-zero-marker-end",
                data: {
                    order: 1,
                    length: 1,
                    startValue: "0..1",
                    endValue: "0..1",
                },
            },
            {
                id: "1->3",
                source: "1",
                target: "3",
                markerStart: "edge-many-marker-start",
                markerEnd: "edge-many-marker-end",
                data: {
                    order: 1,
                    length: 1,
                    startValue: "*",
                    endValue: "*",
                },
            },
        ],
        viewport: { x: 454, y: 140, zoom: 1.14 },
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        loaded: true,
    },
];

interface DiagramStoreProps {
    saving: number;
    loading: boolean;
    diagrams: DiagramData[];
    selectedDiagram: string;
    currentDiagram: DiagramData | null;
    selectDiagram: (id: string) => void;
    createDiagram: () => void;
    duplicateDiagram: () => void;
    deleteDiagram: () => void;
    savingDiagram: () => void;
    saveDiagram: (
        id: string,
        nodes: Node<EntityData>[],
        edges: Edge<ErdEdgeData>[],
        viewport: Viewport
    ) => void;
    loadDiagram: (id: string) => DiagramData | null;
    loadDiagrams: () => void;
    cloneDiagram: (d: DiagramData) => DiagramData;
}

const useDiagramStore = create<DiagramStoreProps>()((set, get) => ({
    saving: 0,
    loading: false,
    diagrams: mockDiagrams,
    selectedDiagram: "1",
    currentDiagram: mockDiagrams[0],
    selectDiagram(id: string) {
        const { selectedDiagram, diagrams, loadDiagram } = get();
        if(selectedDiagram === id) return;
        const diagram = diagrams.find((d) => d.id === id);
        // if (!diagram) {
        //     set({
        //         loading: true,
        //     });
        //     loadDiagram(id);
        // }

        set({
            selectedDiagram: id,
            currentDiagram: diagram,
        });
    },
    createDiagram() {
        const { diagrams } = get();
        let name = "Erd Diagram",
            i = 1;
        for (const d of diagrams) {
            if (d.name === name) {
                name = `Erd Diagram (${i})`;
                i++;
            }
        }
        const newDiagram: DiagramData = {
            id: nanoid(7),
            name,
            nodes: [
                {
                    id: nanoid(5),
                    data: {
                        name: "Entity",
                        attributes: [
                            {
                                id: nanoid(5),
                                name: "id",
                                type: "integer",
                                isPrimaryKey: true,
                                isAutoIncrement: true,
                            },
                            {
                                id: nanoid(5),
                                name: "name",
                                type: "string",
                                length: 30,
                            },
                        ],
                    },
                    position: { x: 0, y: 0 },
                    type: "entity",
                },
            ],
            edges: [],
            createAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            loaded: true,
        };
        set({
            diagrams: [...diagrams, newDiagram],
            selectedDiagram: newDiagram.id,
            currentDiagram: newDiagram,
        });
    },
    updateDiagram() {},
    duplicateDiagram() {
        const { diagrams, selectedDiagram, cloneDiagram } = get();
        if (selectedDiagram === "") return;

        const newDiagram = diagrams.find((d) => d.id === selectedDiagram);
        if (!newDiagram) return;

        const currentDiagram: DiagramData = cloneDiagram(newDiagram);
        currentDiagram.id = nanoid(7);
        const match = newDiagram.name.match(/\scopy\s*\((\d+?)\)$/i);

        if (match) {
            currentDiagram.name =
                newDiagram.name.slice(0, match.index) +
                ` copy (${Number(match[1]) + 1})`;
        } else {
            currentDiagram.name = newDiagram.name + ` copy (1)`;
        }
        currentDiagram.lastUpdate = new Date().toISOString()

        set({
            diagrams: [...diagrams, currentDiagram],
            selectedDiagram: currentDiagram.id,
            currentDiagram,
        });
    },
    deleteDiagram() {
        const { diagrams, selectedDiagram } = get();
        if (selectedDiagram === "") return;

        const newDiagrams = diagrams.filter((d) => d.id !== selectedDiagram);
        let currentDiagram: DiagramData | null = null;
        if (newDiagrams.length === 0) {
            set({
                diagrams: [],
                selectedDiagram: "",
                currentDiagram: null,
            });
        } else {
            currentDiagram = newDiagrams[0];
            for (const d of newDiagrams) {
                if (currentDiagram.lastUpdate < d.lastUpdate) {
                    currentDiagram = d;
                }
            }
            set({
                diagrams: newDiagrams,
                selectedDiagram: currentDiagram.id,
                currentDiagram,
            });
        }
    },
    savingDiagram() {
        set({
            saving: get().saving + 1,
        });
    },
    saveDiagram(
        id: string,
        nodes: Node<EntityData>[],
        edges: Edge<ErdEdgeData>[],
        viewport: Viewport
    ) {
        const { diagrams, cloneDiagram } = get();
        const newDiagrams = diagrams.map((d) => {
            if (d.id !== id) return d;
            const cd = cloneDiagram(d);
            cd.nodes = nodes
            cd.edges = edges
            cd.viewport = viewport
            return cd;
        });

        set({
            saving: 0,
            diagrams: newDiagrams,
        });
    },
    loadDiagram(id: string) {
        return null;
    },
    loadDiagrams() {},
    cloneDiagram(d: DiagramData): DiagramData {
        return {
            ...d,
            nodes: d.nodes.map((n) => {
                return {
                    ...n,
                    position: { ...n.position },
                    measured: { ...n.measured },
                    data: {
                        ...n.data,
                        attributes: n.data.attributes.map((a) => ({ ...a })),
                    },
                };
            }),
            edges: d.edges.map((e) => {
                return {
                    ...e,
                    data: {
                        ...e.data,
                    },
                };
            }),
            viewport: d.viewport === undefined ? undefined : { ...d.viewport },
        };
    },
}));

export default useDiagramStore;
