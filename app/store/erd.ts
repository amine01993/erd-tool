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
} from "@xyflow/react";
import { createWithEqualityFn } from "zustand/traditional";
import { EntityData } from "../components/erd/EntityNode";
import { nanoid } from "nanoid";

export type ErdState = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (params: Connection) => void;
    addConnection: (fromId: string, position: XYPosition) => void;
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
    ],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (params: Connection) => {
        set({
            edges: addEdge(params, get().edges),
        });
    },
    addConnection: (fromId: string, position: XYPosition) => {
        const { nodes } = get();
        let name = "Entity", k = 1;
        while (nodes.some((node) => node.data.name === name)) {
            name = `Entity (${k++})`;
        }

        const newNode: Node = {
            id: nanoid(),
            position,
            data: { name, attributes: [] },
            origin: [0.5, 0.0],
            type: "entity",
        };

        const newEdge: Edge = {
            id: nanoid(),
            source: fromId,
            target: newNode.id,
        };

        set((state) => ({
            nodes: state.nodes.concat(newNode),
            edges: state.edges.concat(newEdge),
        }));
    },
}));

export default useErdStore;
