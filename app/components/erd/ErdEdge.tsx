import {
    BaseEdge,
    Edge,
    EdgeLabelRenderer,
    EdgeProps,
    getSmoothStepPath,
    getStraightPath,
    useInternalNode,
} from "@xyflow/react";
import { getEdgeParams, getSelfLoopPath } from "@/app/helper/items";

export type ErdEdgeData = {
    startLabel: string;
    endLabel: string;
    order: number;
    length: number;
}

function ErdEdge({
    id,
    source,
    target,
    markerStart,
    markerEnd,
    style,
    data,
}: EdgeProps<
    Edge<ErdEdgeData>
>) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    // console.log("ErdEdge", {
    //     id,
    //     source,
    //     target,
    //     order: data?.order,
    //     length: data?.length,
    // });

    if (!sourceNode || !targetNode) {
        return null;
    }

    if (source === target) {
        const edgePath = getSelfLoopPath(
            sourceNode,
            data?.order || 1,
            data?.length || 1
        );

        return (
            <BaseEdge
                path={edgePath}
                markerStart={markerStart}
                markerEnd={markerEnd}
            />
        );
    }

    const { sx, sy, tx, ty } = getEdgeParams(
        sourceNode,
        targetNode,
        data?.order || 1,
        data?.length || 1
    );

    const [edgePath] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <>
            <BaseEdge
                id={id}
                className="react-flow__edge-path"
                path={edgePath}
                markerStart={markerStart}
                markerEnd={markerEnd}
                style={style}
            />

            <EdgeLabelRenderer>
                {data?.startLabel && (
                    <EdgeLabel
                        transform={`translate(-50%, 0%) translate(${sx}px,${sy}px)`}
                        label={data.startLabel}
                    />
                )}
                {data?.endLabel && (
                    <EdgeLabel
                        transform={`translate(-50%, -100%) translate(${tx}px,${ty}px)`}
                        label={data.endLabel}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
}

export default ErdEdge;

function EdgeLabel({ transform, label }: { transform: string; label: string }) {
    return (
        <div
            style={{
                position: "absolute",
                background: "rgba(255, 255, 255, 0.75)",
                padding: "5px 10px",
                color: "#ff5050",
                fontSize: 12,
                fontWeight: 700,
                transform,
            }}
            className="nodrag nopan"
        >
            {label}
        </div>
    );
}
