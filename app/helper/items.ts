import { Position, type InternalNode, type Node } from "@xyflow/react";

// this helper function returns the intersection point
// between the line between the center of the intersectionNode and the target node
function getNodeIntersection(
    intersectionNode: InternalNode<Node>,
    targetNode: InternalNode<Node>,
    edgeOrder: number,
    edgeLength: number
) {
    const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
        intersectionNode.measured;
    const intersectionNodePosition =
        intersectionNode.internals.positionAbsolute;
    const targetPosition = targetNode.internals.positionAbsolute;

    const w = intersectionNodeWidth! / (edgeLength + 1);
    const h = intersectionNodeHeight! / 2;

    const x2 = intersectionNodePosition.x + w * edgeOrder;
    const y2 = intersectionNodePosition.y + h;
    const x1 = targetPosition.x + targetNode.measured.width! / 2;
    const y1 = targetPosition.y + targetNode.measured.height! / 2;

    const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
    const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
    const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
    const xx3 = a * xx1;
    const yy3 = a * yy1;
    const x = w * (xx3 + yy3) + x2;
    const y = h * (-xx3 + yy3) + y2;

    return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(
    node: InternalNode<Node>,
    intersectionPoint: { x: number; y: number }
) {
    const n = { ...node.internals.positionAbsolute, ...node };
    const nx = Math.round(n.x);
    const ny = Math.round(n.y);
    const px = Math.round(intersectionPoint.x);
    const py = Math.round(intersectionPoint.y);

    if (px <= nx + 1) {
        return Position.Left;
    }
    if (px >= nx + n.measured.width! - 1) {
        return Position.Right;
    }
    if (py <= ny + 1) {
        return Position.Top;
    }
    if (py >= n.y + n.measured.height! - 1) {
        return Position.Bottom;
    }

    return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(
    source: InternalNode<Node>,
    target: InternalNode<Node>,
    edgeOrder: number,
    edgeLength: number // is the number of edges connecting the source and target nodes
) {
    console.log("getEdgeParams", {edgeOrder, edgeLength})
    const sourceIntersectionPoint = getNodeIntersection(
        source,
        target,
        edgeOrder,
        edgeLength
    );
    const targetIntersectionPoint = getNodeIntersection(
        target,
        source,
        edgeOrder,
        edgeLength
    );

    // const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
    // const targetPos = getEdgePosition(target, targetIntersectionPoint);

    // console.log("getEdgeParams", {
    //     sourceIntersectionPoint,
    //     targetIntersectionPoint,
    //     sourcePos,
    //     targetPos,
    // });

    return {
        sx: sourceIntersectionPoint.x,
        sy: sourceIntersectionPoint.y,
        tx: targetIntersectionPoint.x,
        ty: targetIntersectionPoint.y,
        // sourcePos,
        // targetPos,
    };
}

export function getConnectionParams(
    source: InternalNode<Node>,
    targetPosition: { x: number; y: number }
) {
    const sourceIntersectionPoint = getNodeIntersection2(
        source,
        targetPosition
    );

    return {
        sx: sourceIntersectionPoint.x,
        sy: sourceIntersectionPoint.y,
        tx: targetPosition.x,
        ty: targetPosition.y,
    };
}

function getNodeIntersection2(
    intersectionNode: InternalNode<Node>,
    toPosition: { x: number; y: number }
) {
    const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
        intersectionNode.measured;
    const intersectionNodePosition =
        intersectionNode.internals.positionAbsolute;

    const w = intersectionNodeWidth! / 2;
    const h = intersectionNodeHeight! / 2;

    const x2 = intersectionNodePosition.x + w;
    const y2 = intersectionNodePosition.y + h;
    const x1 = toPosition.x;
    const y1 = toPosition.y;

    const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
    const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
    const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
    const xx3 = a * xx1;
    const yy3 = a * yy1;
    const x = w * (xx3 + yy3) + x2;
    const y = h * (-xx3 + yy3) + y2;

    return { x, y };
}

export function getSelfLoopPath(
    source: InternalNode<Node>,
    edgeOrder: number,
    edgeLength: number
) {
    const { x, y } = source.internals.positionAbsolute;
    const { width: W, height: H } = source.measured;
    const dx = 25,
        dy = Math.min(30, H! / edgeLength);
    const sx = x;
    const sy = y + dy * edgeOrder;
    const tx = x + source.measured.width!;
    const ty = y + dy * edgeOrder;
    const height = 55 + 2 * dy * (edgeOrder - 1);
    const distance = 30 + dx * edgeOrder;
    const radius = 4;

    // prettier-ignore
    const edgePath = `M ${sx} ${sy} 
        L ${sx - distance + radius} ${sy} 
        Q ${sx - distance},${sy} ${sx - distance},${sy - radius}  
        L ${sx - distance} ${sy - height + radius} 
        Q ${sx - distance},${sy - height} ${sx - distance + radius},${ sy - height }  
        L ${tx + distance - radius} ${ty - height}
        Q ${tx + distance} ${ty - height} ${tx + distance} ${ ty - height + radius }
        L ${tx + distance} ${ty - radius}
        Q ${tx + distance} ${ty} ${tx + distance - radius} ${ty}
        L ${tx} ${ty} `;

    return edgePath;
}
