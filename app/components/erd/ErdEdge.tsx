import { BaseEdge, EdgeProps, getStraightPath } from "@xyflow/react";

function ErdEdge(props: EdgeProps) {
    const { sourceX, sourceY, targetX, targetY } = props;

    const [edgePath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    // console.log("ErdEdge:", edgePath, props);
    return <BaseEdge path={edgePath} {...props} />;
}

export default ErdEdge;
