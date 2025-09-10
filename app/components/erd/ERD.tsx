import { Roboto_Mono } from "next/font/google";
import {
    memo,
    type MouseEvent as RMouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import {
    Background,
    Controls,
    ReactFlow,
    SelectionMode,
    useReactFlow,
    ConnectionMode,
    OnConnectStart,
    FinalConnectionState,
    Edge,
    useOnViewportChange,
    Viewport,
    Node,
} from "@xyflow/react";
import { shallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import cc from "classcat";
import "@xyflow/react/dist/style.css";
import useErdStore, { ErdState } from "../../store/erd";
import useErdItemsStore from "@/app/store/erd-items";
import useDiagramStore from "@/app/store/diagram";
import useUserStore, {
    aiSuggestionsEnabledSelector,
    isAnyModalOrMenuOpenSelector,
} from "@/app/store/user";
import EntityNode from "./EntityNode";
import ErdEdge from "./ErdEdge";
import ErdItemsPanel from "./ErdItemsPanel";
import ErdConnectionLine from "./ErdConnectionLine";
import Markers from "./Markers";
import { ErdEdgeData } from "@/app/type/EdgeType";
import Loading from "./Loading";
import useUpdateDiagram from "@/app/hooks/DiagramUpdate";
import useAddDiagram from "@/app/hooks/DiagramAdd";
import { defaultEdgeOptions } from "@/app/helper/variables";
import { EntityData } from "@/app/type/EntityType";
import AiPrompt from "../diagram/AiPrompt";
import { erdCompletionSchema } from "@/app/erd-completion/schema";
import Export from "../diagram/Export";
import ScreenModePanel from "./ScreenModePanel";

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
    suggestionsAvailable: state.suggestionsAvailable,
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onEdgeHover: state.onEdgeHover,
    onEdgeSelected: state.onEdgeSelected,
    onConnect: state.onConnect,
    addEntity: state.addEntity,
    addConnection: state.addConnection,
    addSelfConnection: state.addSelfConnection,
    getConnectedFromNode: state.getConnectedFromNode,
    getConnectedFromEdge: state.getConnectedFromEdge,
    autoCompleteSuggestion: state.autoCompleteSuggestion,
    setSuggestionsFromSchema: state.setSuggestionsFromSchema,
    clearSuggestions: state.clearSuggestions,
    saveSuggestions: state.saveSuggestions,
});

const nodeOrigin: [number, number] = [0.5, 0];

const ERD = () => {
    const mainWrapper = useRef<HTMLDivElement | null>(null);
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const connectingNodeId = useRef<string | null>(null);
    const { screenToFlowPosition, setViewport, fitView } = useReactFlow();
    const [prevSelection, setPrevSelection] = useState<{
        nodeIds: Set<string>;
        edgeIds: Set<string>;
    }>({ nodeIds: new Set(), edgeIds: new Set() });

    const loading = useDiagramStore((state) => state.loading);
    const persisting = useDiagramStore((state) => state.persisting);
    const persistingViewport = useDiagramStore(
        (state) => state.persistingViewport
    );
    const selectedDiagram = useDiagramStore((state) => state.selectedDiagram);
    const loadDiagrams = useDiagramStore((state) => state.loadDiagrams);
    const loadDiagram = useDiagramStore((state) => state.loadDiagram);
    const saveViewport = useDiagramStore((state) => state.saveViewport);
    const persistDiagram = useDiagramStore((state) => state.persistDiagram);
    const persistDiagramViewport = useDiagramStore(
        (state) => state.persistDiagramViewport
    );
    const aiSuggestionsEnabled = useUserStore(aiSuggestionsEnabledSelector);
    const offLine = useUserStore((state) => state.offLine);

    const {
        suggestionsAvailable,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onEdgeHover,
        onEdgeSelected,
        onConnect,
        addConnection,
        addEntity,
        addSelfConnection,
        getConnectedFromNode,
        getConnectedFromEdge,
        autoCompleteSuggestion,
        setSuggestionsFromSchema,
        clearSuggestions,
        saveSuggestions,
    } = useErdStore(selector, shallow);

    const selectedItem = useErdItemsStore((state) => state.selectedItem);
    const isAnyModalOrMenuOpen = useUserStore(isAnyModalOrMenuOpenSelector);

    useOnViewportChange({
        onEnd: (viewport: Viewport) => {
            saveViewport(viewport);
        },
    });

    const mutation = useUpdateDiagram();
    const mutationAdd = useAddDiagram();

    const { isSuccess, isError, isPending, error } = useQuery({
        queryKey: ["diagrams"],
        queryFn: async () => {
            await loadDiagrams(mutationAdd);
            return Promise.resolve(0);
        },
    });

    const { isError: isErrorDiagram, error: errorDiagram } = useQuery({
        queryKey: ["diagram", { selectedDiagram }],
        queryFn: async () => {
            const diagram = await loadDiagram();
            if (diagram) {
                if (diagram.viewport.x !== 0) {
                    setViewport(diagram.viewport);
                } else {
                    fitView({
                        padding: 0.1,
                    });
                }
            }

            return Promise.resolve(0);
        },
        enabled: selectedDiagram !== "",
        networkMode: "always",
    });

    const {
        isLoading: isLoadingSuggestion,
        submit,
        stop,
    } = useObject({
        api: "/erd-completion",
        schema: erdCompletionSchema,
        onFinish({ object, error }) {
            if (!error && object) {
                setSuggestionsFromSchema(object);
            }
        },
        onError(error) {
            console.error("An error occurred:", error);
        },
    });

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

    const handleNodesAndEdgesHover = useCallback(
        (
            nodes: Node<EntityData>[],
            edges: Edge<ErdEdgeData>[],
            hovered: boolean
        ) => {
            nodes.forEach((n) => {
                const nodeElem = reactFlowWrapper.current?.querySelector(
                    `.react-flow__node-entity[data-id="${n.id}"]`
                );
                if (nodeElem) {
                    nodeElem.classList.toggle("hovered", hovered);
                }
            });

            edges.forEach((e) => {
                const edgeElem = reactFlowWrapper.current?.querySelector(
                    `.react-flow__edge-erd-edge[data-id="${e.id}"]`
                );
                if (edgeElem) {
                    edgeElem.classList.toggle("hovered", hovered);
                }
                onEdgeHover(e, hovered);
            });
        },
        [onEdgeHover]
    );

    const onEdgeMouseEnter = useCallback(
        (_: any, edge: Edge<ErdEdgeData>) => {
            const { edges, nodes } = getConnectedFromEdge(edge);
            handleNodesAndEdgesHover(nodes, edges, true);
        },
        [handleNodesAndEdgesHover, getConnectedFromEdge]
    );

    const onEdgeMouseLeave = useCallback(
        (_: any, edge: Edge<ErdEdgeData>) => {
            const { edges, nodes } = getConnectedFromEdge(edge);
            handleNodesAndEdgesHover(nodes, edges, false);
        },
        [handleNodesAndEdgesHover, getConnectedFromEdge]
    );

    const onNodeMouseEnter = useCallback(
        (_: any, node: Node<EntityData>) => {
            const { edges, nodes } = getConnectedFromNode(node);
            handleNodesAndEdgesHover(nodes, edges, true);
        },
        [handleNodesAndEdgesHover, getConnectedFromNode]
    );

    const onNodeMouseLeave = useCallback(
        (_: any, node: Node<EntityData>) => {
            const { edges, nodes } = getConnectedFromNode(node);
            handleNodesAndEdgesHover(nodes, edges, false);
        },
        [handleNodesAndEdgesHover, getConnectedFromNode]
    );

    const onSelectionChange = useCallback(
        ({
            nodes,
            edges,
        }: {
            nodes: Node<EntityData>[];
            edges: Edge<ErdEdgeData>[];
        }) => {
            if (
                nodes.length === prevSelection.nodeIds.size &&
                edges.length === prevSelection.edgeIds.size &&
                nodes.every(
                    (n) =>
                        prevSelection.nodeIds.has(n.id) &&
                        edges.every((e) => prevSelection.edgeIds.has(e.id))
                )
            ) {
                return;
            } else {
                setPrevSelection({
                    nodeIds: new Set(nodes.map((n) => n.id)),
                    edgeIds: new Set(edges.map((e) => e.id)),
                });
            }

            const uniqueEdges: Map<string, Edge<ErdEdgeData>> = new Map();
            const uniqueNodes: Map<string, Node<EntityData>> = new Map();

            for (const node of nodes) {
                uniqueNodes.set(node.id, node);
                const { edges: eds, nodes: nds } = getConnectedFromNode(node);
                for (const e of eds) {
                    uniqueEdges.set(e.id, e);
                }
                for (const n of nds) {
                    uniqueNodes.set(n.id, n);
                }
            }

            for (const edge of edges) {
                const { edges: eds, nodes: nds } = getConnectedFromEdge(edge);
                for (const e of eds) {
                    uniqueEdges.set(e.id, e);
                }
                for (const n of nds) {
                    uniqueNodes.set(n.id, n);
                }
            }

            const selectedNodeElems =
                reactFlowWrapper.current?.querySelectorAll(
                    `.react-flow__node-entity.selected`
                );
            const selectedEdgeElems =
                reactFlowWrapper.current?.querySelectorAll(
                    `.react-flow__edge-erd-edge.selected`
                );

            selectedNodeElems?.forEach((elem) => {
                elem.classList.remove("selected");
            });
            selectedEdgeElems?.forEach((elem) => {
                const edgeId = (elem as HTMLElement).dataset.id ?? "";
                elem.classList.remove("selected");
                onEdgeSelected(edgeId, false);
            });

            uniqueNodes.forEach((_, id) => {
                const nodeElem = reactFlowWrapper.current?.querySelector(
                    `.react-flow__node-entity[data-id="${id}"]`
                );
                if (nodeElem) {
                    nodeElem.classList.add("selected");
                }
            });

            uniqueEdges.forEach((e, id) => {
                const edgeElem = reactFlowWrapper.current?.querySelector(
                    `.react-flow__edge-erd-edge[data-id="${id}"]`
                );
                if (edgeElem) {
                    edgeElem.classList.add("selected");
                }
                onEdgeSelected(e, true);
            });

            if (
                aiSuggestionsEnabled &&
                (nodes.length > 0 || edges.length > 0)
            ) {
                if (suggestionsAvailable) {
                    // check if suggestions are available in the selected nodes and edges
                    let suggestionExist = false;
                    m: for (const node of nodes) {
                        if (node.data?.isSuggestion) {
                            suggestionExist = true;
                            break;
                        } else {
                            for (const attr of node.data.attributes) {
                                if (attr.isSuggestion) {
                                    suggestionExist = true;
                                    break m;
                                }
                            }
                        }
                    }
                    for (const edge of edges) {
                        if (edge.data?.isSuggestion) {
                            suggestionExist = true;
                            break;
                        }
                    }
                    if (suggestionExist) {
                        saveSuggestions();
                    }
                } else if (!isLoadingSuggestion && !offLine) {
                    autoCompleteSuggestion({ nodes, edges }, submit);
                }
            }
        },
        [
            aiSuggestionsEnabled,
            isLoadingSuggestion,
            suggestionsAvailable,
            prevSelection,
        ]
    );

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (selectedDiagram && persisting) {
            timeoutId = setTimeout(() => {
                persistDiagram(mutation, mutationAdd);
            }, 500);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
    }, [selectedDiagram, persisting]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (selectedDiagram && persistingViewport) {
            timeoutId = setTimeout(() => {
                persistDiagramViewport(mutation, mutationAdd);
            }, 500);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
    }, [selectedDiagram, persistingViewport]);

    useEffect(() => {
        if (selectedDiagram) {
            clearSuggestions();
            stop();
        }
    }, [selectedDiagram]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!isAnyModalOrMenuOpen && suggestionsAvailable) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    clearSuggestions();
                } else if (e.key === "Tab") {
                    e.preventDefault();
                    saveSuggestions();
                }
            }
        }

        if (!aiSuggestionsEnabled) {
            clearSuggestions();
            stop();
        } else {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            if (aiSuggestionsEnabled) {
                window.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, [
        stop,
        clearSuggestions,
        saveSuggestions,
        aiSuggestionsEnabled,
        suggestionsAvailable,
        isAnyModalOrMenuOpen,
    ]);

    useEffect(() => {
        mainWrapper.current = document.getElementById(
            "main-wrapper"
        ) as HTMLDivElement;
    }, []);

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
                onNodeMouseEnter={onNodeMouseEnter}
                onNodeMouseLeave={onNodeMouseLeave}
                onSelectionChange={onSelectionChange}
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
                className={cc(["react-flow-container", selectedItem])}
                onClick={handlePaneClick}
            >
                <Background />
                <Controls showInteractive={false} />
                <ErdItemsPanel />
                <ScreenModePanel />
                {loading && <Loading />}
                {mainWrapper.current &&
                    createPortal(<AiPrompt />, mainWrapper.current)}
                {mainWrapper.current &&
                    createPortal(<Export />, mainWrapper.current)}
            </ReactFlow>
        </div>
    );
};

export default memo(ERD);
