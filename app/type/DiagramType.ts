import { Edge, Node } from "@xyflow/react";
import { EntityData } from "./EntityType";
import { ErdEdgeData } from "./EdgeType";

export interface DiagramData {
    id: string;
    name: string;
    viewport?: { x: number; y: number; zoom: number };
    createAt: string;
    lastUpdate: string;
    loaded?: boolean;
    selected?: boolean;
    history: {
        current: number;
        states: {
            nodes: Node<EntityData>[];
            edges: Edge<ErdEdgeData>[];
        }[];
    };
}
