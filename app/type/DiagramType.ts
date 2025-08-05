import { Edge, Node } from "@xyflow/react";
import { EntityData } from "./EntityType";
import { ErdEdgeData } from "./EdgeType";

export interface DiagramData {
    id: string;
    name: string;
    nodes: Node<EntityData>[];
    edges: Edge<ErdEdgeData>[];
    viewport?: { x: number; y: number; zoom: number };
    createAt: string;
    lastUpdate: string;
    loaded: boolean;
}
