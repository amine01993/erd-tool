import {
    Edge,
    Position,
    XYPosition,
    type InternalNode,
    type Node,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { ErdEdgeData } from "../type/EdgeType";
import { AttributeData, EntityData } from "../type/EntityType";

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
    edgeData: ErdEdgeData,
    screenToFlowPosition: (
        clientPosition: XYPosition,
        options?: {
            snapToGrid: boolean;
        }
    ) => XYPosition
) {
    const { order, length } = edgeData;

    const position = getEdgeAttributePosition(
        source,
        target,
        edgeData,
        screenToFlowPosition
    );

    const sourceIntersectionPoint = getNodeIntersection(
        source,
        target,
        order,
        length
    );
    const targetIntersectionPoint = getNodeIntersection(
        target,
        source,
        order,
        length
    );

    let sourcePos = getEdgePosition(source, sourceIntersectionPoint);
    let targetPos = getEdgePosition(target, targetIntersectionPoint);

    const { width: sW } = source.measured;
    const { width: tW } = target.measured;
    const { x: sX } = source.internals.positionAbsolute;
    const { x: tX } = target.internals.positionAbsolute;
    const sCX = sX + sW! / 2;
    const tCX = tX + tW! / 2;

    if (position.sx === undefined || position.sy === undefined) {
        position.sx = sourceIntersectionPoint.x;
        position.sy = sourceIntersectionPoint.y;
    } else {
        if (sCX <= tCX) {
            sourcePos = Position.Right;
            position.sx += sW! / 2;
        } else {
            sourcePos = Position.Left;
            position.sx -= sW! / 2;
        }
    }

    if (position.tx === undefined || position.ty === undefined) {
        position.tx = targetIntersectionPoint.x;
        position.ty = targetIntersectionPoint.y;
    } else {
        if (tCX <= sCX) {
            targetPos = Position.Right;
            position.tx += tW! / 2;
        } else {
            targetPos = Position.Left;
            position.tx -= tW! / 2;
        }
    }

    return {
        sx: position.sx,
        sy: position.sy,
        tx: position.tx,
        ty: position.ty,
        sourcePos,
        targetPos,
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
    edgeData: ErdEdgeData,
    screenToFlowPosition: (
        clientPosition: XYPosition,
        options?: {
            snapToGrid: boolean;
        }
    ) => XYPosition
) {
    let { order = 1, length = 1, edgePosition } = edgeData;
    const { x, y } = source.internals.positionAbsolute;
    const { width: W, height: H } = source.measured;
    const dx = 5,
        dy = Math.min(30, H! / length);
    let sx = x;
    let sy = y + dy * order;
    let tx = x + source.measured.width!;
    let ty = y + dy * order;
    const height = 55 + 2 * dy * (order - 1);
    const distance = 30 + dx * order;
    const radius = 4;

    const position = getEdgeAttributePosition(
        source,
        source,
        edgeData,
        screenToFlowPosition
    );

    if (position.sx !== undefined && position.sy !== undefined) {
        sy = position.sy;
    }

    if (position.tx !== undefined && position.ty !== undefined) {
        ty = position.ty;
    }

    if (edgePosition === undefined) edgePosition = "l-r";

    const pos2 = edgePosition.split("-");
    const sp = pos2[0] == "l" ? "left" : "right";
    const tp = pos2[1] == "l" ? "left" : "right";

    let edgePath = "";

    if (sp === "left" && tp === "right") {
        // prettier-ignore
        edgePath = `M ${sx} ${sy} 
            L ${sx - distance + radius} ${sy} 
            Q ${sx - distance},${sy} ${sx - distance},${sy - radius}  
            L ${sx - distance} ${sy - height + radius} 
            Q ${sx - distance},${sy - height} ${sx - distance + radius},${sy - height}  
            L ${tx + distance - radius} ${sy - height}
            Q ${tx + distance} ${sy - height} ${tx + distance} ${sy - height + radius}
            L ${tx + distance} ${ty - radius}
            Q ${tx + distance} ${ty} ${tx + distance - radius} ${ty}
            L ${tx} ${ty}`;
    } else if (sp === "right" && tp === "left") {
        // prettier-ignore
        edgePath = `M ${tx} ${sy} 
            L ${tx + distance - radius} ${sy} 
            Q ${tx + distance},${sy} ${tx + distance},${sy - radius}  
            L ${tx + distance} ${sy - height + radius} 
            Q ${tx + distance},${sy - height} ${tx + distance - radius},${sy - height}  
            L ${sx - distance + radius} ${sy - height}
            Q ${sx - distance} ${sy - height} ${sx - distance} ${sy - height + radius}
            L ${sx - distance} ${ty - radius}
            Q ${sx - distance} ${ty} ${sx - distance + radius} ${ty}
            L ${sx} ${ty}`;
        const tmp = sx;
        sx = tx;
        tx = tmp;
    } else if (sp === "left" && tp === "left") {
        // prettier-ignore
        edgePath = `M ${sx} ${sy} 
            L ${sx - distance + radius} ${sy} 
            Q ${sx - distance},${sy} ${sx - distance},${sy + radius}  
            L ${sx - distance} ${ty - radius} 
            Q ${sx - distance},${ty} ${sx - distance + radius},${ty}
            L ${sx} ${ty}`;
        tx = sx;
    } else {
        // prettier-ignore
        edgePath = `M ${tx} ${sy} 
            L ${tx + distance - radius} ${sy} 
            Q ${tx + distance},${sy} ${tx + distance},${sy + radius}  
            L ${tx + distance} ${ty - radius} 
            Q ${tx + distance},${ty} ${tx + distance - radius},${ty}
            L ${tx} ${ty}`;
        sx = tx;
    }

    return { edgePath, sx, sy, tx, ty, sp, tp };
}

function getEdgeAttributePosition(
    source: InternalNode<Node>,
    target: InternalNode<Node>,
    edgeData: ErdEdgeData,
    screenToFlowPosition: (
        clientPosition: XYPosition,
        options?: {
            snapToGrid: boolean;
        }
    ) => XYPosition
): {
    sx?: number;
    sy?: number;
    tx?: number;
    ty?: number;
} {
    const {
        foreignKeyColumn,
        foreignKeyTable,
        primaryKeyColumn,
        primaryKeyTable,
    } = edgeData;

    const sourceData = source.data as EntityData;
    const targetData = target.data as EntityData;

    let sourceAttr: AttributeData | undefined,
        targetAttr: AttributeData | undefined;
    let sx: number | undefined,
        sy: number | undefined,
        tx: number | undefined,
        ty: number | undefined;

    if (sourceData.name === primaryKeyTable) {
        sourceAttr = sourceData.attributes.find(
            (attr) => attr.name === primaryKeyColumn
        );
    } else if (sourceData.name === foreignKeyTable) {
        sourceAttr = sourceData.attributes.find(
            (attr) => attr.name === foreignKeyColumn
        );
    }

    if (sourceAttr) {
        const elem = document.getElementById(sourceAttr.id);
        if (elem) {
            const rect = elem.getBoundingClientRect();
            const fp = screenToFlowPosition({
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
            });
            sx = fp.x;
            sy = fp.y;
        }
    }

    if (targetData.name === foreignKeyTable) {
        targetAttr = targetData.attributes.find(
            (attr) => attr.name === foreignKeyColumn
        );
    } else if (targetData.name === primaryKeyTable) {
        targetAttr = targetData.attributes.find(
            (attr) => attr.name === primaryKeyColumn
        );
    }

    if (targetAttr) {
        const elem = document.getElementById(targetAttr.id);
        if (elem) {
            const rect = elem.getBoundingClientRect();
            const fp = screenToFlowPosition({
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
            });
            tx = fp.x;
            ty = fp.y;
        }
    }

    return { sx, sy, tx, ty };
}

const defaultHeight = 101;
const defaultWidth = 201;

export function getLayoutedElements(
    nodes: Node<EntityData>[],
    edges: Edge<ErdEdgeData>[],
    fixedNodeIds: Set<string> | null = null
): {
    nodes: Node<EntityData>[];
    edges: Edge<ErdEdgeData>[];
} {
    const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(
        () => ({})
    );
    dagreGraph.setGraph({ rankdir: "TB" });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: node.measured?.width ?? defaultWidth,
            height: node.measured?.height ?? defaultHeight,
        });

        if (fixedNodeIds?.has(node.id)) {
            dagreGraph.node(node.id).x = node.position.x;
            dagreGraph.node(node.id).y = node.position.y;
        }
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            measured: {
                width: nodeWithPosition.width,
                height: nodeWithPosition.height,
            },
            position: {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2,
            },
        };

        return newNode;
    });

    return { nodes: newNodes, edges };
}
