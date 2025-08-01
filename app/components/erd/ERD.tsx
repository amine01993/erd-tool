import { Roboto_Mono } from "next/font/google";
import {
    memo,
    type MouseEvent as RMouseEvent,
    useCallback,
    useRef,
} from "react";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    SelectionMode,
    useReactFlow,
    ConnectionMode,
    OnConnectStart,
    FinalConnectionState,
} from "@xyflow/react";
import { shallow } from "zustand/shallow";
import cc from "classcat";
import "@xyflow/react/dist/style.css";
import useErdStore, { ErdState } from "../../store/erd";
import EntityNode from "./EntityNode";
import ErdEdge from "./ErdEdge";
import ErdItemsPanel from "./ErdItemsPanel";
import useErdItemsStore from "@/app/store/erd-items";
import ErdConnectionLine from "./ErdConnectionLine";
// import DevTools from "../devtools/Devtools";

const robotoMono = Roboto_Mono({
    variable: "--font-roboto-mono",
    subsets: ["latin"],
});

const nodeTypes = {
    entity: EntityNode,
};

const edgeTypes = {
    "erd-edge": ErdEdge,
};

const selector = (state: ErdState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addEntity: state.addEntity,
    addConnection: state.addConnection,
    addSelfConnection: state.addSelfConnection,
});

const nodeOrigin: [number, number] = [0.5, 0];

const defaultEdgeOptions = {
    type: "erd-edge",
    markerStart: "edge-one-marker-start",
    markerEnd: "edge-many-marker-end",
    data: {
        order: 1,
        length: 1,
        startValue: "1",
        endValue: "*",
    },
};

const ERD = () => {
    const reactFlowWrapper = useRef(null);
    const connectingNodeId = useRef<string | null>(null);
    const { screenToFlowPosition } = useReactFlow();

    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addConnection,
        addEntity,
        addSelfConnection,
    } = useErdStore(selector, shallow);
    const { selectedItem } = useErdItemsStore();

    const onConnectEnd = useCallback(
        (
            event: MouseEvent | TouchEvent,
            connectionState: FinalConnectionState
        ) => {
            if (
                connectionState.fromNode &&
                connectionState.fromNode?.id === connectionState.toNode?.id
            ) {
                addSelfConnection(connectionState.fromNode.id);
                return;
            }

            // we only want to create a new node if the connection ends on the pane
            const targetIsPane = (event.target as Element).classList.contains(
                "react-flow__pane"
            );

            if (!targetIsPane || !connectingNodeId.current) {
                return;
            }

            // when a connection is dropped on the pane it's not valid
            if (!connectionState.isValid) {
                // we need to remove the wrapper bounds, in order to get the correct position
                const { clientX, clientY } =
                    "changedTouches" in event ? event.changedTouches[0] : event;
                const position = screenToFlowPosition({
                    x: clientX,
                    y: clientY,
                });
                const fromId = connectionState.fromNode!.id;

                addConnection(fromId, position);
            }
        },
        [screenToFlowPosition]
    );

    const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
        connectingNodeId.current = nodeId;
    }, []);

    const handlePaneClick = useCallback(
        (event: RMouseEvent) => {
            if (selectedItem !== "entity") {
                return;
            }

            const erdItemsPanelElem = (event.target as HTMLElement).closest(
                ".erd-items-panel"
            );
            const erdEntityElem = (event.target as HTMLElement).closest(
                ".entity-node"
            );
            if (erdItemsPanelElem || erdEntityElem) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            addEntity(position);
        },
        [selectedItem]
    );

    return (
        <div
            className={`${robotoMono.className} h-full w-full`}
            ref={reactFlowWrapper}
        >
            <svg style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}>
                <defs>
                    <marker
                        id="edge-zero-marker-start"
                        viewBox="0 0 108 215"
                        markerHeight={11}
                        markerWidth={11}
                        refX={-20}
                        refY={107}
                        orient="auto"
                    >
                        <circle
                            cx="60.5"
                            cy="107.5"
                            r="33.5"
                            style={{
                                fill: "#fff",
                                stroke: "#000",
                                strokeWidth: 28,
                                strokeMiterlimit: 10,
                            }}
                        />
                    </marker>
                    <marker
                        id="edge-zero-marker-end"
                        viewBox="0 0 108 215"
                        markerHeight={11}
                        markerWidth={11}
                        refX={125}
                        refY={110}
                        orient="auto"
                    >
                        <circle
                            cx="48.5"
                            cy="107.5"
                            r="33.5"
                            style={{
                                fill: "#fff",
                                stroke: "#000",
                                strokeWidth: 28,
                                strokeMiterlimit: 10,
                            }}
                        />
                    </marker>
                    <marker
                        id="edge-one-marker-start"
                        viewBox="0 0 108 215"
                        markerHeight={11}
                        markerWidth={11}
                        refX={0}
                        refY={110}
                        orient="auto"
                    >
                        <path d="M63 0h29v215H63z" />
                    </marker>
                    <marker
                        id="edge-one-marker-end"
                        viewBox="0 0 108 215"
                        markerHeight={11}
                        markerWidth={11}
                        refX={100}
                        refY={110}
                        orient="auto"
                    >
                        <path d="M16 0h29v215H16z" />
                    </marker>
                    <marker
                        id="edge-many-marker-start"
                        viewBox="0 0 108 215"
                        markerHeight={11}
                        markerWidth={11}
                        refX={0}
                        refY={110}
                        orient="auto"
                    >
                        <path d="M0 92.5h108v29H0z" />
                        <path d="M20.8 193.5 93.2 121l-20.5-20.5L0 173v41.9z" />
                        <path d="M72.7 113.5 0 41V0l20.8 20.5L93.2 93z" />
                    </marker>
                    <marker
                        id="edge-many-marker-end"
                        viewBox="0 0 108 215"
                        markerHeight={11}
                        markerWidth={11}
                        refX={100}
                        refY={110}
                        orient="auto"
                    >
                        <path d="M0 92.5h108v29H0z" />
                        <path d="M87.2 193.5 14.8 121l20.5-20.5L108 173v41.9z" />
                        <path d="M35.3 113.5 108 41V0L87.2 20.5 14.8 93z" />
                    </marker>
                </defs>
            </svg>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                panOnScroll
                selectionOnDrag
                panOnDrag={false}
                selectionMode={SelectionMode.Partial}
                selectNodesOnDrag={false}
                elementsSelectable={selectedItem === "selector"}
                nodeOrigin={nodeOrigin}
                connectionMode={ConnectionMode.Loose}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionLineComponent={ErdConnectionLine}
                fitView
                className={cc(["react-flow-container", selectedItem])}
                onClick={handlePaneClick}
            >
                <Background />
                <Controls showInteractive={false} />
                <MiniMap />
                {/* <DevTools /> */}
                <ErdItemsPanel />
            </ReactFlow>
        </div>
    );
};

export default memo(ERD);
