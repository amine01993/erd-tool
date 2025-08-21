import { create } from "zustand";
import { Node, Edge, Viewport } from "@xyflow/react";
import { nanoid } from "nanoid";
import { DiagramData } from "../type/DiagramType";
import { ErdEdgeData } from "../type/EdgeType";
import { EntityData } from "../type/EntityType";
import useErdStore from "./erd";
import useUserStore from "./user";

const url =
    "https://9nnhrbiki6.execute-api.us-east-1.amazonaws.com/prod/diagrams";

export const mockDiagrams: DiagramData[] = [
    {
        id: "1",
        name: "Sample Diagram",
        viewport: { x: 454, y: 140, zoom: 1.14 },
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        loaded: true,
        persisted: false,
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
    persistingNew: number;
    persistingViewport: number;
    persistingDelete: boolean;
    loading: boolean;
    diagrams: DiagramData[];
    selectedDiagram: string;
    disableUndo: boolean;
    disableRedo: boolean;
    selectDiagram: (id: string) => void;
    getSelectedDiagram: () => DiagramData | undefined;
    getName: (prefix?: string, nbr?: number) => string;
    updateDiagramName: (
        name: string
    ) => Promise<{ isValid: boolean; message: string }>;
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
    persistDiagram: () => Promise<void>;
    persistNewDiagram: () => Promise<void>;
    persistDiagramViewport: () => Promise<void>;
    persistDiagramDelete: () => Promise<void>;
    loadDiagram: () => Promise<any>;
    loadDiagrams: (token: string) => Promise<void>;
    cloneDiagram: (d: DiagramData) => DiagramData;
}

const useDiagramStore = create<DiagramStoreProps>()((set, get) => ({
    persisting: 0,
    persistingNew: 0,
    persistingViewport: 0,
    persistingDelete: false,
    loading: false,
    diagrams: [],
    selectedDiagram: "",
    disableUndo: true,
    disableRedo: true,
    selectDiagram(id: string) {
        const { selectedDiagram } = get();
        const { clearSelection } = useErdStore.getState();
        if (selectedDiagram === id) return;
        console.log("selectDiagram:", id);

        set({
            selectedDiagram: id,
        });
        clearSelection();
    },
    getSelectedDiagram() {
        const { selectedDiagram, diagrams } = get();
        const diagram = diagrams.find((d) => d.id === selectedDiagram);
        return diagram;
    },
    async loadDiagram() {
        const { diagrams, getSelectedDiagram } = get();
        const { jwtToken } = useUserStore.getState();
        const { setErd } = useErdStore.getState();

        const currentDiagram = getSelectedDiagram();
        if (!currentDiagram) return;
        else if (currentDiagram.loaded) {
            set({
                disableUndo:
                    currentDiagram?.history.current === undefined ||
                    currentDiagram.history.current <= 0,
                disableRedo:
                    currentDiagram?.history.current === undefined ||
                    currentDiagram.history.current >=
                        currentDiagram.history.states.length - 1,
            });
            setErd(currentDiagram);
            return currentDiagram;
        }

        if (!currentDiagram.loaded && jwtToken) {
            set({
                loading: true,
            });
            const response = await fetch(`${url}?id=${currentDiagram.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            const diagram = await response.json();
            set({
                loading: false,
                diagrams: diagrams.map((d) => {
                    if (d.id === currentDiagram.id) {
                        return {
                            ...diagram,
                            loaded: true,
                            persisted: true,
                        };
                    }
                    return d;
                }),
                disableUndo:
                    diagram?.history.current === undefined ||
                    diagram.history.current <= 0,
                disableRedo:
                    diagram?.history.current === undefined ||
                    diagram.history.current >=
                        diagram.history.states.length - 1,
            });
            setErd(diagram);
            return diagram;
        }
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
            diagrams.forEach((d) => {
                d.loaded = false;
                d.persisted = true;
            });
        }

        let chosenDiagram = mockDiagrams[0];
        if (diagrams.length > 0) {
            chosenDiagram = diagrams[0];
            for (const d of diagrams) {
                if (d.lastUpdate > chosenDiagram.lastUpdate) {
                    chosenDiagram = d;
                }
            }
        }

        set({
            diagrams: diagrams.length === 0 ? mockDiagrams : diagrams,
            selectedDiagram: chosenDiagram.id,
        });
    },
    getName: (prefix?: string, nbr?: number) => {
        const { diagrams } = get();
        prefix = prefix ?? "Erd Diagram";
        let k = nbr ?? 1,
            name = "";
        do {
            name = `${prefix} (${k++})`;
        } while (diagrams.some((diagram) => diagram.name === name));

        return name;
    },
    async updateDiagramName(name: string) {
        const { jwtToken } = useUserStore.getState();
        const { selectedDiagram, diagrams } = get();
        if (name === "")
            return { isValid: false, message: "Name cannot be empty" };

        const diagram = diagrams.find(
            (d) => selectedDiagram !== d.id && d.name === name
        );
        if (diagram) {
            return { isValid: false, message: "Name already exists" };
        }

        set({
            diagrams: diagrams.map((d) => {
                if (d.id === selectedDiagram) {
                    return {
                        ...d,
                        name,
                    };
                }
                return d;
            }),
        });

        if (jwtToken) {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${jwtToken}`,
                },
                body: JSON.stringify({
                    id: selectedDiagram,
                    name: name,
                }),
            });
            // const result = await response.json();
        }

        return { isValid: true, message: "Name updated successfully" };
    },
    createDiagram() {
        const { diagrams, persistingNew, getName } = get();
        let name = getName();

        const newDiagram: DiagramData = {
            id: nanoid(7),
            name,
            viewport: {
                x: 0,
                y: 0,
                zoom: 1,
            },
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
            persisted: false,
        };
        set({
            persistingNew: persistingNew + 1,
            diagrams: [...diagrams, newDiagram],
            selectedDiagram: newDiagram.id,
            disableUndo: true,
            disableRedo: true,
        });
    },
    duplicateDiagram() {
        const {
            loading,
            diagrams,
            persistingNew,
            getSelectedDiagram,
            cloneDiagram,
            getName,
        } = get();
        if (loading) return;

        const newDiagram = getSelectedDiagram();

        if (!newDiagram) return;

        const currentDiagram: DiagramData = cloneDiagram(newDiagram);
        currentDiagram.id = nanoid(7);
        const match = newDiagram.name.match(/\((\d+?)\)$/i);

        let prefix = match
            ? newDiagram.name.slice(0, match.index)
            : newDiagram.name;
        let nbr = match ? parseInt(match[1]) : undefined;
        currentDiagram.name = getName(prefix.trim(), nbr);

        currentDiagram.lastUpdate = new Date().toISOString();
        currentDiagram.persisted = false;

        set({
            persistingNew: persistingNew + 1,
            diagrams: [...diagrams, currentDiagram],
            selectedDiagram: currentDiagram.id,
            disableUndo: true,
            disableRedo: true,
        });
    },
    deleteDiagram() {
        const { loading, diagrams, selectedDiagram, persistDiagramDelete } =
            get();

        if (loading || selectedDiagram === "") return;

        const newDiagrams = diagrams.filter((d) => d.id !== selectedDiagram);
        let newSelectedDiagram = "";

        if (newDiagrams.length === 0) {
            set({
                persistingDelete: true,
                diagrams: [],
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
                persistingDelete: true,
                diagrams: newDiagrams,
            });
            newSelectedDiagram = currentDiagram.id;
        }

        persistDiagramDelete().then(() => {
            set({ selectedDiagram: newSelectedDiagram });
        });
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
            cd.lastUpdate = new Date().toISOString();
            return cd;
        });

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
        const {
            persistingViewport,
            diagrams,
            getSelectedDiagram,
            cloneDiagram,
        } = get();

        const currentDiagram = getSelectedDiagram();

        if (
            currentDiagram?.viewport.x === viewport.x &&
            currentDiagram?.viewport.y === viewport.y &&
            currentDiagram?.viewport.zoom === viewport.zoom
        ) {
            return;
        }

        const newDiagrams = diagrams.map((d) => {
            if (d.id !== currentDiagram?.id) return d;
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
        const {
            loading,
            selectedDiagram,
            disableUndo,
            persisting,
            diagrams,
            cloneDiagram,
        } = get();
        const { setErd } = useErdStore.getState();

        if (loading || disableUndo || selectedDiagram === "") return;

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
            persisting: persisting + 1,
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
        const {
            loading,
            selectedDiagram,
            disableRedo,
            persisting,
            diagrams,
            cloneDiagram,
        } = get();
        const { setErd } = useErdStore.getState();

        if (loading || disableRedo || selectedDiagram === "") return;

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
            persisting: persisting + 1,
            disableUndo: diagram === undefined || diagram.history.current <= 0,
            disableRedo:
                diagram === undefined ||
                diagram.history.current >= diagram.history.states.length - 1,
        });
        if (diagram) {
            setErd(diagram);
        }
    },
    async persistDiagram() {
        const { jwtToken } = useUserStore.getState();
        const { getSelectedDiagram } = get();

        const currentDiagram = getSelectedDiagram();
        if (currentDiagram && jwtToken) {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${jwtToken}`,
                },
                body: JSON.stringify({
                    id: currentDiagram.id,
                    history: currentDiagram.history,
                }),
            });
            // const result = await response.json();
        }

        set({
            persisting: 0,
        });
    },
    async persistNewDiagram() {
        const { jwtToken } = useUserStore.getState();
        const { diagrams } = get();

        for (const diagram of diagrams) {
            if (!diagram.persisted && jwtToken) {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${jwtToken}`,
                    },
                    body: JSON.stringify(diagram),
                });
                // const result = await response.json();

                set({
                    diagrams: diagrams.map((d) => {
                        if (d.id === diagram.id && !d.persisted) {
                            return {
                                ...d,
                                persisted: true,
                            };
                        }
                        return d;
                    }),
                });
            }
        }

        set({
            persistingNew: 0,
        });
    },
    async persistDiagramViewport() {
        const { jwtToken } = useUserStore.getState();
        const { getSelectedDiagram } = get();

        const currentDiagram = getSelectedDiagram();
        if (currentDiagram && jwtToken) {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${jwtToken}`,
                },
                body: JSON.stringify({
                    id: currentDiagram.id,
                    viewport: currentDiagram.viewport,
                }),
            });
            // const result = await response.json();
        }

        set({
            persistingViewport: 0,
        });
    },
    async persistDiagramDelete() {
        const { jwtToken } = useUserStore.getState();
        const { selectedDiagram } = get();

        if (selectedDiagram && jwtToken) {
            const response = await fetch(`${url}?id=${selectedDiagram}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${jwtToken}`,
                },
            });
            // const result = await response.json();
        }
        set({
            persistingDelete: false,
        });
    },
    cloneDiagram(d: DiagramData): DiagramData {
        return {
            ...d,
            viewport: { ...d.viewport },
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
