import { Edge, Node } from "@xyflow/react";
import { EntityData } from "./EntityType";
import { ErdEdgeData } from "./EdgeType";

export interface DiagramData {
    id: string;
    name: string;
    viewport: { x: number; y: number; zoom: number };
    createAt: string;
    lastUpdate: string;
    loaded: boolean;
    history: {
        current: number;
        states: {
            nodes: Node<EntityData>[];
            edges: Edge<ErdEdgeData>[];
        }[];
    };
    deletedAt?: string;
}

export interface DiagramDataUpdate {
    id: string;
    name?: string;
    history?: DiagramData["history"];
    viewport?: DiagramData["viewport"];
}

export type DiagramCategory = "all" | "deleted";

