import { Roboto_Mono } from "next/font/google";
import { memo, useCallback, useState } from "react";
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
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import EntityNode from "./EntityNode";

const robotoMono = Roboto_Mono({
    variable: "--font-roboto-mono",
    subsets: ["latin"],
});

const nodeTypes = {
    entity: EntityNode,
};

const initialNodes: Node[] = [
    { id: "1", data: { label: "Node 1" }, position: { x: 0, y: 0 }, type: "entity" },
    { id: "2", data: { label: "Node 2" }, position: { x: 100, y: 0 }, type: "entity" },
    { id: "3", data: { label: "Node 3" }, position: { x: 200, y: 0 }, type: "entity" },
];

const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
];

const ERD = () => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nodesSnapshot) => {
            return applyNodeChanges(changes, nodesSnapshot);
        });
    }, []);
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) =>
            setEdges((edgesSnapshot) => {
                return applyEdgeChanges(changes, edgesSnapshot);
            }),
        []
    );
    const onConnect = useCallback((params: Connection) => {
        return setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    }, []);

    return (
        <div className={`${robotoMono.className} h-full w-full`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                // nodesDraggable={true}
                // nodesConnectable={true}
                // elementsSelectable={true}
                panOnScroll
                selectionOnDrag
                panOnDrag={false}
                selectionMode={SelectionMode.Partial}
                // zoomOnScroll={true}
                // zoomOnPinch={true}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};

export default memo(ERD);
