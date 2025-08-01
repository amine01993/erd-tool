import {
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
    Connection,
    addEdge,
    XYPosition,
    useInternalNode,
    NodeSelectionChange,
} from "@xyflow/react";
import { createWithEqualityFn } from "zustand/traditional";
import { nanoid } from "nanoid";
import { ErdEdgeData } from "../components/erd/ErdEdge";
import { EntityData, AttributeData } from "../type/EntityType";

export type ErdState = {
    selectedNodeId: string | null;
    nodes: Node<EntityData>[];
    edges: Edge<ErdEdgeData>[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (params: Connection) => void;
    getName: () => string;
    addConnection: (fromId: string, position: XYPosition) => void;
    addEntity: (position: XYPosition) => void;
    addSelfConnection: (nodeId: string) => void;
    updateEdgeLabel: (id: string, type: "start" | "end", label: string) => void;
    addAttribute: (id: string, attribute: AttributeData) => void;
    editAttribute: (id: string, attribute: AttributeData) => void;
    removeAttribute: (id: string, attributeId: string) => void;
    updateEntityName: (id: string, newName: string) => void;
};

const useErdStore = createWithEqualityFn<ErdState>((set, get) => ({
    selectedNodeId: null,
    nodes: [
        {
            id: "1",
            data: {
                name: "Node 1",
                attributes: [
                    { id: nanoid(5), name: "Attribute 1", type: "string" },
                    { id: nanoid(5), name: "Attribute 2", type: "integer" },
                    { id: nanoid(5), name: "Attribute 3", type: "boolean" },
                ],
            },
            position: { x: 0, y: 0 },
            type: "entity",
        },
        {
            id: "2",
            data: {
                name: "Node 2",
                attributes: [
                    { id: nanoid(5), name: "Attribute 4", type: "string" },
                    { id: nanoid(5), name: "Attribute 5", type: "integer" },
                ],
            },
            position: { x: -200, y: 200 },
            type: "entity",
        },
        {
            id: "3",
            data: {
                name: "Node 3",
                attributes: [
                    { id: nanoid(5), name: "Attribute 6", type: "string" },
                    { id: nanoid(5), name: "Attribute 7", type: "integer" },
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
    onNodesChange: (changes: NodeChange[]) => {
        const { selectedNodeId } = get();
        let selectedId = selectedNodeId;

        for (const change of changes) {
            const selected = (change as NodeSelectionChange).selected;

            if (selected) {
                selectedId = (change as NodeSelectionChange).id;
                break;
            }
        }

        set({
            selectedNodeId: selectedId,
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        console.log("onEdgesChange");
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (params: Connection) => {
        const { source, target } = params;
        const { edges } = get();

        const sharedEdges = edges
            .filter(
                (e) =>
                    (e.source === source && e.target === target) ||
                    (e.source === target && e.target === source)
            )
            .map((e) => e.id);

        const newEdge: Edge<ErdEdgeData> = {
            id: nanoid(),
            source,
            target,
            data: {
                order: sharedEdges.length + 1,
                length: sharedEdges.length + 1,
                startValue: "1",
                endValue: "*",
            },
        };

        set((state) => {
            state.edges.forEach((e) => {
                if (sharedEdges.includes(e.id) && e.data) {
                    e.data.length = sharedEdges.length + 1;
                }
            });
            return {
                edges: state.edges.concat(newEdge),
            };
        });
    },
    getName: () => {
        const { nodes } = get();
        let name = "Entity",
            k = 1;
        while (nodes.some((node) => node.data.name === name)) {
            name = `Entity (${k++})`;
        }
        return name;
    },
    addEntity(position: XYPosition) {
        const { getName } = get();
        let name = getName();

        const newNode: Node<EntityData> = {
            id: nanoid(),
            position,
            data: { name, attributes: [] },
            origin: [0.5, 0.0],
            type: "entity",
        };

        set((state) => ({
            nodes: state.nodes.concat(newNode),
        }));
    },
     addConnection: (fromId: string, position: XYPosition) => {
        const { getName } = get();
        let name = getName();

        const newNode: Node<EntityData> = {
            id: nanoid(),
            position,
            data: { name, attributes: [] },
            origin: [0.5, 0.0],
            type: "entity",
        };

        const newEdge: Edge<ErdEdgeData> = {
            id: nanoid(),
            source: fromId,
            target: newNode.id,
        };

        set((state) => ({
            nodes: state.nodes.concat(newNode),
            edges: state.edges.concat(newEdge),
        }));
    },
    addSelfConnection: (nodeId: string) => {
        const { edges } = get();

        const sharedEdges = edges
            .filter((e) => e.source === nodeId && e.target === nodeId)
            .map((e) => e.id);

        const newEdge: Edge<ErdEdgeData> = {
            id: nanoid(),
            source: nodeId,
            target: nodeId,
            markerStart: "edge-one-marker-start",
            markerEnd: "edge-one-marker-end",
            data: {
                order: sharedEdges.length + 1,
                length: sharedEdges.length + 1,
                startValue: "1",
                endValue: "1",
            },
        };

        set((state) => {
            state.edges.forEach((e) => {
                if (sharedEdges.includes(e.id) && e.data) {
                    e.data.length = sharedEdges.length + 1;
                }
            });
            return {
                edges: state.edges.concat(newEdge),
            };
        });
    },
    updateEdgeLabel(id: string, type: "start" | "end", label: string) {
        const { edges } = get();

        let marker;
        switch (label) {
            case "0..1":
                marker = "edge-zero-marker";
                break;
            case "1":
                marker = "edge-one-marker";
                break;
            default:
                marker = "edge-many-marker";
                break;
        }
        marker += "-" + type;

        set({
            edges: edges.map((e) => {
                if (e.id !== id) return e;
                return {
                    ...e,
                    markerStart: type === "start" ? marker : e.markerStart,
                    markerEnd: type === "end" ? marker : e.markerEnd,
                    data: {
                        ...e.data!,
                        startValue:
                            type === "start" ? label : e.data!.startValue,
                        endValue: type === "end" ? label : e.data!.endValue,
                    },
                };
            }),
        });
    },
    addAttribute(id: string, attribute: AttributeData) {
        const { nodes } = get();

        set({
            nodes: nodes.map((n) => {
                if (n.id !== id) return n;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        attributes: [...n.data.attributes, attribute],
                    },
                };
            }),
        });
    },
    editAttribute(id: string, attribute: AttributeData) {
        const { nodes } = get();

        set({
            nodes: nodes.map((n) => {
                if (n.id !== id) return n;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        attributes: n.data.attributes.map((a) => {
                            if (a.id !== attribute.id) return a;
                            return attribute;
                        }),
                    },
                };
            }),
        });
    },
    removeAttribute(id: string, attributeId: string) {
        const { nodes } = get();

        set({
            nodes: nodes.map((n) => {
                if (n.id !== id) return n;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        attributes: n.data.attributes.filter(
                            (a) => a.id !== attributeId
                        ),
                    },
                };
            }),
        });
    },
    updateEntityName(id: string, newName: string) {
        const { nodes } = get();

        set({
            nodes: nodes.map((n) => {
                if (n.id !== id) return n;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        name: newName,
                    },
                };
            }),
        });
    }
}));

export default useErdStore;
