import {
    ConnectionLineComponentProps,
    getStraightPath,
    useReactFlow,
} from "@xyflow/react";
import useErdStore from "@/app/store/erd";
import {
    getConnectionParams,
    getEdgeParams,
    getSelfLoopPath,
} from "@/app/helper/items";
import { defaultEdgeDataValues } from "@/app/helper/variables";

const ErdConnectionLine = ({
    toX,
    toY,
    fromNode,
    toNode,
}: ConnectionLineComponentProps) => {
    let edgePath = "";
    const screenToFlowPosition = useReactFlow().screenToFlowPosition;

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
        const edges = useErdStore.getState().edges;
        const existingEdge = edges.find(
            (edge) =>
                (edge.source === fromNode.id && edge.target === toNode.id) ||
                (edge.source === toNode.id && edge.target === fromNode.id)
        );

        const { sx, sy, tx, ty } = getEdgeParams(
            fromNode,
            toNode,
            existingEdge?.data ?? {...defaultEdgeDataValues},
            screenToFlowPosition
        );

        [edgePath] = getStraightPath({
            sourceX: sx,
            sourceY: sy,
            targetX: tx,
            targetY: ty,
        });
    } else {
        const edges = useErdStore.getState().edges;
        const existingEdge = edges.find(
            (edge) => edge.source === fromNode.id && edge.target === fromNode.id
        );

        const path = getSelfLoopPath(
            fromNode,
            existingEdge?.data ?? {...defaultEdgeDataValues},
            screenToFlowPosition
        );
        edgePath = path.edgePath;
    }

    return (
        <path
            fill="none"
            className="erd-connection-line"
            d={edgePath}
        />
    );
};

export default ErdConnectionLine;
