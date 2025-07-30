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
} from "@xyflow/react";
import { createWithEqualityFn } from "zustand/traditional";
import { EntityData } from "../components/erd/EntityNode";
import { nanoid } from "nanoid";
import { ErdEdgeData } from "../components/erd/ErdEdge";

export type ErdState = {
    nodes: Node[];
    edges: Edge<ErdEdgeData>[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (params: Connection) => void;
    getName: () => string;
    addConnection: (fromId: string, position: XYPosition) => void;
    addNode: (position: XYPosition) => void;
    addSelfConnection: (nodeId: string) => void;
};

const useErdStore = createWithEqualityFn<ErdState>((set, get) => ({
    nodes: [
        {
            id: "1",
            data: {
                name: "Node 1",
                attributes: [
                    { name: "Attribute 1", type: "string" },
                    { name: "Attribute 2", type: "integer" },
                    { name: "Attribute 3", type: "boolean" },
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
                    { name: "Attribute 4", type: "string" },
                    { name: "Attribute 5", type: "integer" },
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
                    { name: "Attribute 6", type: "string" },
                    { name: "Attribute 7", type: "integer" },
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
            markerStart: "edge-one-marker-start",
            markerEnd: "edge-one-marker-end",
            data: {
                order: 1,
                length: 1,
                startLabel: "1",
                endLabel: "1",
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
                startLabel: "N",
                endLabel: "N",
            },
        },
    ],
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        console.log("onEdgesChange")
        // set({
        //     edges: applyEdgeChanges(changes, get().edges),
        // });
    },
    onConnect: (params: Connection) => {
        console.log("onConnect", params);
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
            // markerStart: "edge-one-marker-start",
            // markerEnd: "edge-many-marker-end",
            data: {
                order: sharedEdges.length + 1,
                length: sharedEdges.length + 1,
                startLabel: "1",
                endLabel: "*",
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
    addConnection: (fromId: string, position: XYPosition) => {
        console.log("addConnection", fromId);
        const { getName } = get();
        let name = getName();

        const newNode: Node = {
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
            // markerStart: "edge-one-marker-start",
            // markerEnd: "edge-many-marker-end",
            // data: {
            //     order: 1,
            //     length: 1,
            //     startLabel: "1",
            //     endLabel: "*",
            // },
        };

        set((state) => ({
            nodes: state.nodes.concat(newNode),
            edges: state.edges.concat(newEdge),
        }));
    },
    addNode(position: XYPosition) {
        const { getName } = get();
        let name = getName();

        const newNode: Node = {
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
    addSelfConnection: (nodeId: string) => {
        console.log("addSelfConnection", nodeId);
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
                startLabel: "1",
                endLabel: "1",
            },
        };

        // set((state) => ({
        //     edges: state.edges.concat(newEdge),
        // }));
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
}));

export default useErdStore;
