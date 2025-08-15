import { create } from "zustand";
import { Node, Edge, Viewport } from "@xyflow/react";
import { nanoid } from "nanoid";
import { DiagramData } from "../type/DiagramType";
import { ErdEdgeData } from "../type/EdgeType";
import { EntityData } from "../type/EntityType";
import useErdStore from "./erd";

const url =
    "https://g1z9a9ebrk.execute-api.us-east-1.amazonaws.com/prod/diagrams";

export const mockDiagrams: DiagramData[] = [
    {
        id: "1",
        name: "Sample Diagram",
        viewport: { x: 454, y: 140, zoom: 1.14 },
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        loaded: true,
        history: {
            current: 0,
            states: [
                {
                    nodes: [
                        {
                            id: "1",
                            data: {
                                name: "Node_1",
                                attributes: [
                                    {
                                        id: nanoid(5),
                                        name: "Attribute_1",
                                        type: "string",
                                    },
                                    {
                                        id: nanoid(5),
                                        name: "Attribute_2",
                                        type: "integer",
                                    },
                                    {
                                        id: nanoid(5),
                                        name: "Attribute_3",
                                        type: "boolean",
                                    },
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
                                    {
                                        id: nanoid(5),
                                        name: "Attribute_4",
                                        type: "string",
                                    },
                                    {
                                        id: nanoid(5),
                                        name: "Attribute_5",
                                        type: "integer",
                                    },
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
                                    {
                                        id: nanoid(5),
                                        name: "Attribute_6",
                                        type: "string",
                                    },
                                    {
                                        id: nanoid(5),
                                        name: "Attribute_7",
                                        type: "integer",
                                    },
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
                },
            ],
        },
    },
];

interface DiagramStoreProps {
    persisting: number;
    persistingViewport: number;
    loading: boolean;
    diagrams: DiagramData[];
    selectedDiagram: string;
    disableUndo: boolean;
    disableRedo: boolean;
    // currentDiagram: DiagramData | null;
    selectDiagram: (id: string) => void;
    getSelectedDiagram: () => DiagramData | undefined;
    createDiagram: () => void;
    duplicateDiagram: () => void;
    deleteDiagram: () => void;
    saveDiagram: (
        nodes: Node<EntityData>[],
        edges: Edge<ErdEdgeData>[]
    ) => void;
    saveViewport: (viewport: Viewport) => void;
    undoAction: () => void;
    redoAction: () => void;
    persistDiagram: () => void;
    persistDiagramViewport: () => void;
    loadDiagram: (id: string) => DiagramData | null;
    loadDiagrams: (token: string) => void;
    cloneDiagram: (d: DiagramData) => DiagramData;
}

const useDiagramStore = create<DiagramStoreProps>()((set, get) => ({
    persisting: 0,
    persistingViewport: 0,
    loading: false,
    diagrams: [],
    selectedDiagram: "",
    disableUndo: true,
    disableRedo: true,
    selectDiagram(id: string) {
        const { selectedDiagram, diagrams, loadDiagram } = get();
        if (selectedDiagram === id) return;
        const diagram = diagrams.find((d) => d.id === id);
        // if (!diagram) {
        //     set({
        //         loading: true,
        //     });
        //     loadDiagram(id);
        // }

        set({
            selectedDiagram: id,
            // currentDiagram: diagram,
            disableUndo:
                diagram?.history.current === undefined ||
                diagram.history.current > 0,
            disableRedo:
                diagram?.history.current === undefined ||
                diagram.history.current < diagram.history.states.length - 1,
        });
    },
    getSelectedDiagram() {
        const { selectedDiagram, diagrams } = get();
        const diagram = diagrams.find((d) => d.id === selectedDiagram);
        return diagram;
    },
    loadDiagram(id: string) {
        return null;
    },
    async loadDiagrams(token: string) {
        let diagrams: DiagramData[] = [];
        if (token) {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            });
            diagrams = await response.json();
        }
        console.log("loadDiagrams", { diagrams });
        set({
            diagrams: diagrams.length === 0 ? mockDiagrams : diagrams,
            selectedDiagram: diagrams.length === 0 ? mockDiagrams[0].id : diagrams[0].id,
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
            createAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            loaded: true,
            history: {
                current: 0,
                states: [
                    {
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
                    },
                ],
            },
        };
        set({
            diagrams: [...diagrams, newDiagram],
            selectedDiagram: newDiagram.id,
            // currentDiagram: newDiagram,
            disableUndo: true,
            disableRedo: true,
        });
    },
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
        currentDiagram.lastUpdate = new Date().toISOString();

        set({
            diagrams: [...diagrams, currentDiagram],
            selectedDiagram: currentDiagram.id,
            // currentDiagram,
            disableUndo: true,
            disableRedo: true,
        });
    },
    deleteDiagram() {
        const { diagrams, selectedDiagram, getSelectedDiagram } = get();
        if (selectedDiagram === "") return;

        const newDiagrams = diagrams.filter((d) => d.id !== selectedDiagram);
        if (newDiagrams.length === 0) {
            set({
                diagrams: [],
                selectedDiagram: "",
                // currentDiagram: null,
                disableUndo: true,
                disableRedo: true,
            });
        } else {
            let currentDiagram = newDiagrams[0];
            for (const d of newDiagrams) {
                if (currentDiagram.lastUpdate < d.lastUpdate) {
                    currentDiagram = d;
                }
            }
            set({
                diagrams: newDiagrams,
                selectedDiagram: currentDiagram.id,
                // currentDiagram,
                disableUndo: currentDiagram.history.current <= 0,
                disableRedo:
                    currentDiagram.history.current >=
                    currentDiagram.history.states.length - 1,
            });
        }
    },
    saveDiagram(nodes: Node<EntityData>[], edges: Edge<ErdEdgeData>[]) {
        const { persisting, selectedDiagram, diagrams, cloneDiagram } = get();
        let diagram: DiagramData | undefined;
        const newDiagrams = diagrams.map((d) => {
            if (d.id !== selectedDiagram) return d;
            const cd = cloneDiagram(d);
            diagram = cd;
            if (cd.history.current === cd.history.states.length - 1) {
                cd.history.states.push({
                    nodes,
                    edges,
                });
            } else {
                cd.history.states = cd.history.states.slice(
                    0,
                    cd.history.current + 1
                );
                cd.history.states.push({
                    nodes,
                    edges,
                });
            }
            cd.history.current = cd.history.states.length - 1;
            return cd;
        });
        console.log("saveDiagram", { diagram });

        set({
            persisting: persisting + 1,
            diagrams: newDiagrams,
            disableUndo: diagram === undefined || diagram.history.current <= 0,
            disableRedo:
                diagram === undefined ||
                diagram.history.current >= diagram.history.states.length - 1,
        });
    },
    saveViewport(viewport: Viewport) {
        const { persistingViewport, selectedDiagram, diagrams, cloneDiagram } =
            get();

        const newDiagrams = diagrams.map((d) => {
            if (d.id !== selectedDiagram) return d;
            const cd = cloneDiagram(d);
            cd.viewport = viewport;
            return cd;
        });

        set({
            persistingViewport: persistingViewport + 1,
            diagrams: newDiagrams,
        });
    },
    undoAction() {
        const { selectedDiagram, diagrams, cloneDiagram } = get();
        const { setErd } = useErdStore.getState();

        let diagram: DiagramData | undefined;
        const newDiagrams = diagrams.map((d) => {
            if (d.id !== selectedDiagram) return d;
            const cd = cloneDiagram(d);
            diagram = cd;
            if (cd.history.current > 0) {
                cd.history.current--;
            }
            return cd;
        });

        set({
            diagrams: newDiagrams,
            disableUndo: diagram === undefined || diagram.history.current <= 0,
            disableRedo:
                diagram === undefined ||
                diagram.history.current >= diagram.history.states.length - 1,
        });
        if (diagram) {
            setErd(diagram);
        }
    },
    redoAction() {
        const { selectedDiagram, diagrams, cloneDiagram } = get();
        const { setErd } = useErdStore.getState();

        let diagram: DiagramData | undefined;
        const newDiagrams = diagrams.map((d) => {
            if (d.id !== selectedDiagram) return d;
            const cd = cloneDiagram(d);
            diagram = cd;
            if (cd.history.current < cd.history.states.length - 1) {
                cd.history.current++;
            }
            return cd;
        });

        set({
            diagrams: newDiagrams,
            disableUndo: diagram === undefined || diagram.history.current <= 0,
            disableRedo:
                diagram === undefined ||
                diagram.history.current >= diagram.history.states.length - 1,
        });
        if (diagram) {
            setErd(diagram);
        }
    },
    persistDiagram() {},
    persistDiagramViewport() {},
    cloneDiagram(d: DiagramData): DiagramData {
        return {
            ...d,
            viewport: d.viewport === undefined ? undefined : { ...d.viewport },
            history: {
                ...d.history,
                states: d.history.states.map((s) => {
                    return {
                        nodes: s.nodes.map((n) => {
                            return {
                                ...n,
                                position: { ...n.position },
                                measured: { ...n.measured },
                                data: {
                                    ...n.data,
                                    attributes: n.data.attributes.map((a) => ({
                                        ...a,
                                    })),
                                } as EntityData,
                            };
                        }),
                        edges: s.edges.map((e) => {
                            return {
                                ...e,
                                data: {
                                    ...e.data,
                                } as ErdEdgeData,
                            };
                        }),
                    };
                }),
            },
        };
    },
}));

export default useDiagramStore;
