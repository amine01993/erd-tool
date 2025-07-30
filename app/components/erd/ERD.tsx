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
    ConnectionLineType,
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
    addConnection: state.addConnection,
    addNode: state.addNode,
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
        startLabel: "1",
        endLabel: "*",
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
        addNode,
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

            addNode(position);
        },
        [selectedItem]
    );

    return (
        <div
            className={`${robotoMono.className} h-full w-full`}
            ref={reactFlowWrapper}
        >
            <svg style={{ position: "absolute", top: 0, left: 0 }}>
                <defs>
                    <marker
                        id="edge-one-marker-start"
                        viewBox="0 74 85 147"
                        markerHeight={20}
                        markerWidth={20}
                        refX={-50}
                        refY={148}
                        orient="auto"
                        className="edge-one-marker-start"
                    >
                        <path
                            className="edge-one-marker-start"
                            style={{
                                stroke: "#00f",
                                strokeWidth: 20,
                            }}
                            d="M55 221.5v-141M0 147.5h85"
                        />
                    </marker>
                    <marker
                        id="edge-one-marker-end"
                        viewBox="0 74 85 147"
                        markerHeight={20}
                        markerWidth={20}
                        refX={150}
                        refY={148}
                        orient="auto"
                    >
                        <path
                            className="edge-one-marker-end"
                            style={{
                                stroke: "#000",
                                strokeWidth: 20,
                            }}
                            d="M30 73.5v141m55-67H0"
                        />
                    </marker>
                    <marker
                        id="edge-many-marker-start"
                        viewBox="0 74 85 147"
                        markerHeight={20}
                        markerWidth={20}
                        refX={-50}
                        refY={148}
                        orient="auto"
                    >
                        <path
                            className="edge-many-marker-start"
                            d="m10 212.5 66.5-68M10 82.5l66.5 68"
                            style={{
                                fill: "none",
                                stroke: "#000",
                                strokeWidth: 20,
                            }}
                        ></path>
                        <path
                            className="edge-many-marker-start"
                            style={{
                                stroke: "#000",
                                strokeWidth: 20,
                            }}
                            d="M0 147.5h85"
                        ></path>
                    </marker>
                    <marker
                        id="edge-many-marker-end"
                        viewBox="0 74 85 147"
                        markerHeight={20}
                        markerWidth={20}
                        refX={150}
                        refY={148}
                        orient="auto"
                    >
                        <path
                            className="edge-many-marker-end"
                            d="m76.5 82.5-66.5 68m66.5 62-66.5-68"
                            style={{
                                fill: "none",
                                stroke: "#000",
                                strokeWidth: 20,
                            }}
                        />
                        <path
                            className="edge-many-marker-end"
                            d="M0 147.5h85"
                            style={{
                                stroke: "#000",
                                strokeWidth: 20,
                            }}
                        />
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
