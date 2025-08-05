import { Roboto_Mono } from "next/font/google";
import {
    memo,
    type MouseEvent as RMouseEvent,
    useCallback,
    useEffect,
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
    Edge,
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
import Markers from "./Markers";
import DevTools from "../devtools/Devtools";
import { ErdEdgeData } from "@/app/type/EdgeType";
import useDiagramStore from "@/app/store/diagram";

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
    selectedNodeId: state.selectedNodeId,
    nodes: state.nodes,
    edges: state.edges,
    initErd: state.initErd,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onEdgeHover: state.onEdgeHover,
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
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const connectingNodeId = useRef<string | null>(null);
    const {
        viewportInitialized,
        screenToFlowPosition,
        getViewport,
        setViewport,
        fitView,
    } = useReactFlow();

    const { loading, saving, selectedDiagram, currentDiagram, saveDiagram } =
        useDiagramStore();

    const {
        // selectedNodeId,
        nodes,
        edges,
        initErd,
        onNodesChange,
        onEdgesChange,
        onEdgeHover,
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

    const onEdgeMouseEnter = useCallback((_: any, edge: Edge<ErdEdgeData>) => {
        const edgeElem = reactFlowWrapper.current?.querySelector(
            `.react-flow__edge-erd-edge[data-id="${edge.id}"]`
        );
        if (edgeElem) {
            edgeElem.classList.add("hovered");
        }
        onEdgeHover(edge, true);
    }, []);

    const onEdgeMouseLeave = useCallback((_: any, edge: Edge<ErdEdgeData>) => {
        const edgeElem = reactFlowWrapper.current?.querySelector(
            `.react-flow__edge-erd-edge[data-id="${edge.id}"]`
        );
        if (edgeElem) {
            edgeElem.classList.remove("hovered");
        }
        onEdgeHover(edge, false);
    }, []);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (selectedDiagram && saving) {
            timeoutId = setTimeout(() => {
                saveDiagram(selectedDiagram, nodes, edges, getViewport());
            }, 500);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
    }, [selectedDiagram, saving]);

    useEffect(() => {
        if (!viewportInitialized) return;
        if (currentDiagram) {
            initErd(currentDiagram.nodes, currentDiagram.edges);
            if (currentDiagram.viewport) {
                setViewport(currentDiagram.viewport);
            } else {
                fitView({
                    padding: 0.1,
                });
            }
        } else {
            initErd([], []);
        }
    }, [currentDiagram, viewportInitialized]);

    return (
        <div
            className={`${robotoMono.className} h-full w-full`}
            ref={reactFlowWrapper}
        >
            <Markers />
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
                onEdgeMouseEnter={onEdgeMouseEnter}
                onEdgeMouseLeave={onEdgeMouseLeave}
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
