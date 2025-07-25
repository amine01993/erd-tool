import { Roboto_Mono } from "next/font/google";
import { memo, useCallback, useRef, useState } from "react";
import {
    Background,
    Controls,
    Node,
    Edge,
    MiniMap,
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    NodeChange,
    EdgeChange,
    Connection,
    SelectionMode,
    useReactFlow,
    ConnectionMode,
    ConnectionLineType,
    OnConnectStart,
    OnConnectEnd,
    ConnectionState,
    FinalConnectionState,
} from "@xyflow/react";
import { shallow } from "zustand/shallow";
import "@xyflow/react/dist/style.css";
import useErdStore, { ErdState } from "../../store/erd";
import EntityNode from "./EntityNode";
import ErdEdge from "./ErdEdge";
import ErdItems from "./ErdItems";
import useErdItemsStore from "@/app/store/erd-items";
import cc from "classcat";
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
});

const nodeOrigin: [number, number] = [0.5, 0];

const defaultEdgeOptions = {
    type: "erd-edge",
    style: { stroke: "#000" },
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
    } = useErdStore(selector, shallow);
    const { selectedItem } = useErdItemsStore();

    const onConnectEnd = useCallback(
        (
            event: MouseEvent | TouchEvent,
            connectionState: FinalConnectionState
        ) => {
            // we only want to create a new node if the connection ends on the pane
            const targetIsPane = (event.target as Element).classList.contains(
                "react-flow__pane"
            );

            if (!targetIsPane || !connectingNodeId.current) {
                return;
            }

            // when a connection is dropped on the pane it's not valid
            // console.log("onConnectEnd", event, connectionState);
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

    return (
        <div
            className={`${robotoMono.className} h-full w-full`}
            ref={reactFlowWrapper}
        >
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
                connectionLineType={ConnectionLineType.Straight}
                connectionLineStyle={{ stroke: "#000" }}
                fitView
                className={cc(["react-flow-container", selectedItem])}
            >
                <Background />
                <Controls showInteractive={false} />
                <MiniMap />
                {/* <DevTools /> */}
                <ErdItems />
            </ReactFlow>
        </div>
    );
};

export default memo(ERD);
