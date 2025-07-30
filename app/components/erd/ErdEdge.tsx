import {
    ChangeEvent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    BaseEdge,
    Edge,
    EdgeLabelRenderer,
    EdgeProps,
    getSmoothStepPath,
    useInternalNode,
} from "@xyflow/react";
import { Icon } from "@iconify/react";
import { getEdgeParams, getSelfLoopPath } from "@/app/helper/items";
import useErdStore from "@/app/store/erd";

export type ErdEdgeData = {
    startValue: string;
    endValue: string;
    order: number;
    length: number;
};

const EdgeLabel = memo(
    ({
        transform,
        value,
        edgeId,
        type,
    }: {
        transform: string;
        value: string;
        edgeId: string;
        type: "start" | "end";
    }) => {
        const selectElem = useRef<HTMLSelectElement>(null);
        const updateEdgeLabel = useErdStore((state) => state.updateEdgeLabel);
        const [editing, setEditing] = useState(false);
        const [label, setLabel] = useState(value);

        const toggleEdit = useCallback(() => {
            setEditing((prev) => !prev);
        }, [setEditing]);

        const handleChange = useCallback(
            (e: ChangeEvent<HTMLSelectElement>) => {
                setLabel(e.target.value);
                setEditing(false);
                updateEdgeLabel(edgeId, type, e.target.value);
            },
            [edgeId, type, updateEdgeLabel]
        );

        useEffect(() => {
            if (editing && selectElem.current) {
                selectElem.current.focus();
            }
        }, [editing]);

        return (
            <div
                style={{
                    transform,
                }}
                className="nodrag nopan edge-label"
            >
                {!editing && <button onClick={toggleEdit}>{label}</button>}
                {editing && (
                    <>
                        <select
                            value={label}
                            ref={selectElem}
                            onChange={handleChange}
                            onBlur={toggleEdit}
                        >
                            <option value="0..1">0..1</option>
                            <option value="1">1</option>
                            <option value="*">*</option>
                        </select>
                        <Icon
                            icon="tabler:chevron-down"
                            width="10"
                            height="10"
                            className="absolute right-0.5 top-1/2 -translate-y-1/2"
                        />
                    </>
                )}
            </div>
        );
    }
);

function ErdEdge({
    id,
    source,
    target,
    markerStart,
    markerEnd,
    style,
    data,
}: EdgeProps<Edge<ErdEdgeData>>) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    let edgePath = "",
        sp = "left",
        tp = "right",
        sourceX = null,
        targetX = null,
        sourceY = null,
        targetY = null;

    if (source === target) {
        edgePath = getSelfLoopPath(
            sourceNode,
            data?.order || 1,
            data?.length || 1
        );
    } else {
        const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
            sourceNode,
            targetNode,
            data?.order || 1,
            data?.length || 1
        );

        [edgePath] = getSmoothStepPath({
            sourceX: sx,
            sourceY: sy,
            sourcePosition: sourcePos,
            targetX: tx,
            targetY: ty,
            targetPosition: targetPos,
            borderRadius: 4,
        });
        sp = sourcePos;
        tp = targetPos;
        sourceX = sx;
        sourceY = sy;
        targetX = tx;
        targetY = ty;
    }

    const { sTX, sTY, tTX, tTY } = useMemo(() => {
        let sTX = 0,
            sTY = 0,
            tTX = 0,
            tTY = 0;
        if (sp === "bottom") {
            sTX = -50;
            sTY = 75;
            tTX = -50;
            tTY = -150;
        } else if (sp === "top") {
            sTX = -50;
            sTY = -150;
            tTX = -50;
            tTY = 75;
        } else if (sp === "left") {
            sTX = -150;
            sTY = 75;
            tTX = 50;
            tTY = -150;
        } else if (sp === "right") {
            sTX = 50;
            sTY = -150;
            tTX = -150;
            tTY = 75;
        }
        return { sTX, sTY, tTX, tTY };
    }, [sp]);

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
                {data?.startValue && (
                    <EdgeLabel
                        transform={`translate(${sTX}%, ${sTY}%) translate(${sourceX}px,${sourceY}px)`}
                        value={data.startValue}
                        type="start"
                        edgeId={id}
                    />
                )}
                {data?.endValue && (
                    <EdgeLabel
                        transform={`translate(${tTX}%, ${tTY}%) translate(${targetX}px,${targetY}px)`}
                        value={data.endValue}
                        type="end"
                        edgeId={id}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
}

export default ErdEdge;
