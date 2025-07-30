import {
    ConnectionLineComponentProps,
    Edge,
    getStraightPath,
} from "@xyflow/react";
import {
    getConnectionParams,
    getEdgeParams,
    getSelfLoopPath,
} from "@/app/helper/items";
import useErdStore from "@/app/store/erd";
import { ErdEdgeData } from "./ErdEdge";
import { useMemo } from "react";

const ErdConnectionLine = ({
    toX,
    toY,
    connectionStatus,
    fromNode,
    toNode,
}: ConnectionLineComponentProps) => {
    let edgePath = "";

    if (toNode === null) {
        const { sx, sy, tx, ty } = getConnectionParams(fromNode, {
            x: toX,
            y: toY,
        });

        [edgePath] = getStraightPath({
            sourceX: sx,
            sourceY: sy,
            targetX: tx,
            targetY: ty,
        });
    } else if (fromNode.id !== toNode.id) {
        const edges = useErdStore().edges;
        const existingEdge = edges.find(
            (edge) =>
                (edge.source === fromNode.id && edge.target === toNode.id) ||
                (edge.source === toNode.id && edge.target === fromNode.id)
        );

        const { sx, sy, tx, ty } = getEdgeParams(
            fromNode,
            toNode,
            (existingEdge?.data?.length || 0) + 1,
            (existingEdge?.data?.length || 0) + 1
        );

        [edgePath] = getStraightPath({
            sourceX: sx,
            sourceY: sy,
            targetX: tx,
            targetY: ty,
        });
    } else {
        const edges = useErdStore().edges;
        const existingEdge = edges.find(
            (edge) => edge.source === fromNode.id && edge.target === fromNode.id
        );

        edgePath = getSelfLoopPath(
            fromNode,
            (existingEdge?.data?.length || 0) + 1,
            (existingEdge?.data?.length || 0) + 1
        );
    }

    return (
        <path
            fill="none"
            // stroke={connectionStatus === "valid" ? "#22c55e" : "#ef4444"}
            className="erd-connection-line"
            // strokeWidth={2}
            d={edgePath}
        />
    );
};

export default ErdConnectionLine;
