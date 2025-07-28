import {
    BaseEdge,
    EdgeProps,
    getStraightPath,
    useInternalNode,
} from "@xyflow/react";
import { getEdgeParams } from "@/app/helper/items";

function ErdEdge({ id, source, target, markerEnd, style }: EdgeProps) {
    const sourceNode = useInternalNode(source);

    if (!sourceNode) {
        return null;
    }

    if (source === target) {
        const {x, y} = sourceNode.internals.positionAbsolute;
        const sx = x + sourceNode.measured.width!;
        const sy = y + 30;
        const tx = x;
        const ty = y + 30;
        const radiusX = (sx - tx) * 0.6;
        const radiusY = 50;
        const edgePath = `M ${
            sx - 5
        } ${sy} A ${radiusX} ${radiusY} 0 1 0 ${tx + 2} ${ty}`;

        return <BaseEdge path={edgePath} markerEnd={markerEnd} />;
    }


    const targetNode = useInternalNode(target);

    if (!targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode
    );

    const [edgePath] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
            style={style}
        />
    );
}

export default ErdEdge;
