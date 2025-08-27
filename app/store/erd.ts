import {
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
    Connection,
    XYPosition,
    NodeSelectionChange,
    NodePositionChange,
    NodeDimensionChange,
    EdgeSelectionChange,
} from "@xyflow/react";
import { createWithEqualityFn } from "zustand/traditional";
import { nanoid } from "nanoid";
import useDiagramStore, { isReadOnlySelector } from "./diagram";
import useUserStore from "./user";
import { DiagramData } from "../type/DiagramType";
import { EntityData, AttributeData } from "../type/EntityType";
import { ErdEdgeData } from "../type/EdgeType";
import { defaultEdgeOptions } from "../helper/variables";

export type ErdState = {
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    loaded: boolean;
    nodes: Node<EntityData>[];
    edges: Edge<ErdEdgeData>[];
    getMarkersName: (
        startVal: string,
        endVal: string
    ) => { markerStart: string; markerEnd: string };
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onEdgeHover: (edge: Edge<ErdEdgeData>, hovered: boolean) => void;
    onConnect: (params: Connection) => void;
    clearSelection: () => void;
    setErd: (diagram: DiagramData) => void;
    getName: () => string;
    addConnection: (fromId: string, position: XYPosition) => void;
    addEntity: (position: XYPosition) => void;
    addSelfConnection: (nodeId: string) => void;
    updateEdgeLabel: (id: string, type: "start" | "end", label: string) => void;
    addAttribute: (id: string, attribute: AttributeData) => void;
    editAttribute: (id: string, attribute: AttributeData) => void;
    removeAttribute: (id: string, attributeId: string) => void;
    updateEntityName: (id: string, newName: string) => void;
    handleForeignKeyConstraint: (
        oldForeignKey: string,
        foreignKey: string,
        reference: string,
        onDelete: string,
        onUpdate: string
    ) => void;
};

const useErdStore = createWithEqualityFn<ErdState>((set, get) => ({
    selectedNodeId: null,
    selectedEdgeId: null,
    loaded: false,
    nodes: [],
    edges: [],
    clearSelection() {
        set({ selectedNodeId: null, selectedEdgeId: null });
    },
    setErd(diagram: DiagramData) {
        const state = diagram.history.states[diagram.history.current];
        const nodes = state.nodes;
        const edges = state.edges;
        let selectedNodeId = null;

        for (const node of nodes) {
            if (node.selected) {
                selectedNodeId = node.id;
                break;
            }
        }

        set({
            nodes,
            edges,
            selectedNodeId,
        });
    },
    getMarkersName(startVal: string, endVal: string) {
        let markerStart = "",
            markerEnd = "";
        if (startVal === "*") {
            markerStart = "edge-many-marker-start";
        }
        if (startVal === "1") {
            markerStart = "edge-one-marker-start";
        }
        if (startVal === "0..1") {
            markerStart = "edge-zero-marker-start";
        }
        if (endVal === "*") {
            markerEnd = "edge-many-marker-end";
        }
        if (endVal === "1") {
            markerEnd = "edge-one-marker-end";
        }
        if (endVal === "0..1") {
            markerEnd = "edge-zero-marker-end";
        }
        return { markerStart, markerEnd };
    },
    onNodesChange: (changes: NodeChange[]) => {
        const { selectedNodeId, nodes, edges, loaded } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());
        let selectedId = selectedNodeId,
            saving = false,
            update = false;

        for (const change of changes) {
            const selected = (change as NodeSelectionChange).selected;

            if (selected) {
                selectedId = (change as NodeSelectionChange).id;
            }

            if (change.type === "position") {
                if ((change as NodePositionChange).dragging === false)
                    saving = true;
                if ((change as NodePositionChange).dragging !== undefined)
                    update = true;
            }

            if (change.type === "dimensions") {
                if ((change as NodeDimensionChange).resizing === false)
                    saving = true;
                if ((change as NodeDimensionChange).resizing !== undefined)
                    update = true;
            }

            if (change.type === "remove") {
                saving = true;
            }
        }

        if (update && isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const newNodes = applyNodeChanges(changes, nodes);

        set({
            selectedNodeId: selectedId,
            nodes: newNodes as any,
            loaded: true,
        });
        if (selectedId) {
            set({ selectedEdgeId: null });
        }

        if (loaded && saving) {
            saveDiagram(newNodes as any, edges);
        }
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        const { selectedEdgeId, edges, nodes, getMarkersName } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());
        let saving = false,
            selectedId = selectedEdgeId,
            removedId = null;
        for (const change of changes) {
            const selected = (change as EdgeSelectionChange).selected;

            if (selected) {
                selectedId = (change as EdgeSelectionChange).id;
            }

            if (change.type === "remove") {
                saving = true;
                removedId = change.id;
            }
        }

        if (saving && isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const deletedEdge = edges.find((e) => e.id === removedId);

        const newEdges = applyEdgeChanges(changes, edges);
        newEdges.forEach((e) => {
            if (e.data) {
                let { markerStart, markerEnd } = getMarkersName(
                    String(e.data.startValue),
                    String(e.data.endValue)
                );
                if (e.selected) {
                    markerStart += "-selected";
                    markerEnd += "-selected";
                }
                e.markerStart = markerStart;
                e.markerEnd = markerEnd;
            }
        });

        const newNodes = nodes.map((n) => {
            if (
                (n.id === deletedEdge?.source ||
                    n.id === deletedEdge?.target) &&
                n.data.name === deletedEdge?.data?.foreignKeyTable
            ) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        attributes: n.data.attributes.map((attr) => {
                            if (
                                attr.name ===
                                deletedEdge?.data?.foreignKeyColumn
                            ) {
                                return {
                                    ...attr,
                                    isForeignKey: false,
                                };
                            }
                            return attr;
                        }),
                    },
                };
            }
            return n;
        });

        set({
            selectedEdgeId: selectedId,
            edges: newEdges as any,
            nodes: newNodes,
        });
        if (selectedId) {
            set({ selectedNodeId: null });
        }
        if (saving) {
            saveDiagram(newNodes, newEdges as any);
        }
    },
    onEdgeHover: (edge: Edge<ErdEdgeData>, hovered: boolean) => {
        const { edges, getMarkersName } = get();
        if (edge.selected) return;
        if (edge.data) {
            let { markerStart, markerEnd } = getMarkersName(
                String(edge.data.startValue),
                String(edge.data.endValue)
            );
            if (hovered) {
                markerStart += "-hover";
                markerEnd += "-hover";
            }
            set({
                edges: edges.map((e) => {
                    if (e.id !== edge.id) return e;
                    return {
                        ...edge,
                        markerStart,
                        markerEnd,
                    };
                }),
            });
        }
    },
    onConnect: (params: Connection) => {
        const { source, target } = params;
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const sharedEdges = edges
            .filter(
                (e) =>
                    (e.source === source && e.target === target) ||
                    (e.source === target && e.target === source)
            )
            .map((e) => e.id);

        const sourceNode = nodes.find((n) => n.id === source);
        const targetNode = nodes.find((n) => n.id === target);

        let primaryKeyColumn =
            sourceNode?.data.attributes.find((attr) => attr.isPrimaryKey)
                ?.name ?? "";
        let primaryKeyTable = sourceNode?.data.name ?? "";
        if (!primaryKeyColumn) {
            primaryKeyColumn =
                targetNode?.data.attributes.find((attr) => attr.isPrimaryKey)
                    ?.name ?? "";
            primaryKeyTable = targetNode?.data.name ?? "";
        }

        const newEdge: Edge<ErdEdgeData> = {
            id: nanoid(),
            source,
            target,
            data: {
                order: sharedEdges.length + 1,
                length: sharedEdges.length + 1,
                startValue: "1",
                endValue: "*",
                primaryKeyColumn,
                primaryKeyTable,
                foreignKeyColumn: "",
                foreignKeyTable: "",
            },
        };

        const newEdges = edges.map((e) => {
            if (sharedEdges.includes(e.id) && e.data) {
                return {
                    ...e,
                    data: {
                        ...e.data,
                        length: sharedEdges.length + 1,
                    },
                };
            }
            return e;
        });
        newEdges.push(newEdge);

        set({
            edges: newEdges,
            nodes,
        });

        saveDiagram(nodes, newEdges);
    },
    getName: () => {
        const { nodes } = get();
        let name = "Entity",
            k = 1;
        while (nodes.some((node) => node.data.name === name)) {
            name = `Entity_${k++}`;
        }
        return name;
    },
    addEntity(position: XYPosition) {
        const { nodes, edges, getName } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        let name = getName();
        const newNode: Node<EntityData> = {
            id: nanoid(),
            position,
            data: { name, attributes: [] },
            origin: [0.5, 0.0],
            type: "entity",
        };

        const newNodes = [...nodes, newNode];

        set({
            nodes: newNodes,
        });

        saveDiagram(newNodes, edges);
    },
    addConnection: (fromId: string, position: XYPosition) => {
        const { nodes, edges, getName } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        let name = getName();

        const sourceNode = nodes.find((n) => n.id === fromId);

        let primaryKeyColumn =
            sourceNode?.data.attributes.find((attr) => attr.isPrimaryKey)
                ?.name ?? "";
        let primaryKeyTable = sourceNode?.data.name ?? "";

        const newNode: Node<EntityData> = {
            id: nanoid(),
            position,
            data: { name, attributes: [] },
            origin: [0.5, 0.0],
            type: "entity",
        };

        const newEdge: Edge<ErdEdgeData> = {
            id: nanoid(),
            source: fromId,
            target: newNode.id,
            data: {
                ...defaultEdgeOptions.data,
                primaryKeyColumn,
                primaryKeyTable,
            },
        };

        const newNodes = [...nodes, newNode];
        const newEdges = [...edges, newEdge];

        set({
            nodes: newNodes,
            edges: newEdges,
        });

        saveDiagram(newNodes, newEdges);
    },
    addSelfConnection: (nodeId: string) => {
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const sharedEdges = edges
            .filter((e) => e.source === nodeId && e.target === nodeId)
            .map((e) => e.id);

        const sourceNode = nodes.find((n) => n.id === nodeId);

        let primaryKeyColumn =
            sourceNode?.data.attributes.find((attr) => attr.isPrimaryKey)
                ?.name ?? "";
        let primaryKeyTable = sourceNode?.data.name ?? "";

        const newEdge: Edge<ErdEdgeData> = {
            id: nanoid(),
            source: nodeId,
            target: nodeId,
            markerStart: "edge-one-marker-start",
            markerEnd: "edge-one-marker-end",
            data: {
                order: sharedEdges.length + 1,
                length: sharedEdges.length + 1,
                startValue: "1",
                endValue: "1",
                primaryKeyColumn,
                primaryKeyTable,
                foreignKeyColumn: "",
                foreignKeyTable: "",
            },
        };

        const newEdges = edges.map((e) => {
            if (sharedEdges.includes(e.id) && e.data) {
                return {
                    ...e,
                    data: {
                        ...e.data,
                        length: sharedEdges.length + 1,
                    },
                };
            }
            return e;
        });
        newEdges.push(newEdge);

        set({
            edges: newEdges,
            nodes,
        });

        saveDiagram(nodes, newEdges);
    },
    updateEdgeLabel(id: string, type: "start" | "end", label: string) {
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        let marker;
        switch (label) {
            case "0..1":
                marker = "edge-zero-marker";
                break;
            case "1":
                marker = "edge-one-marker";
                break;
            default:
                marker = "edge-many-marker";
                break;
        }
        marker += "-" + type;

        const newEdges = edges.map((e) => {
            if (e.id !== id) return e;
            let markerStart = type === "start" ? marker : String(e.markerStart);
            let markerEnd = type === "end" ? marker : String(e.markerEnd);
            if (!markerStart.endsWith("-selected")) {
                markerStart += "-selected";
            }
            if (!markerEnd.endsWith("-selected")) {
                markerEnd += "-selected";
            }
            return {
                ...e,
                markerStart,
                markerEnd,
                data: {
                    ...e.data!,
                    startValue: type === "start" ? label : e.data!.startValue,
                    endValue: type === "end" ? label : e.data!.endValue,
                },
            };
        });

        set({
            edges: newEdges,
        });

        saveDiagram(nodes, newEdges);
    },
    addAttribute(id: string, attribute: AttributeData) {
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const newNodes = nodes.map((n) => {
            if (n.id !== id) return n;
            return {
                ...n,
                data: {
                    ...n.data,
                    attributes: [...n.data.attributes, attribute],
                },
            };
        });

        set({
            nodes: newNodes,
        });

        saveDiagram(newNodes, edges);
    },
    editAttribute(id: string, attribute: AttributeData) {
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const newNodes = nodes.map((n) => {
            if (n.id !== id) return n;
            return {
                ...n,
                data: {
                    ...n.data,
                    attributes: n.data.attributes.map((a) => {
                        if (a.id !== attribute.id) return a;
                        return attribute;
                    }),
                },
            };
        });

        set({
            nodes: newNodes,
        });

        saveDiagram(newNodes, edges);
    },
    removeAttribute(id: string, attributeId: string) {
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const newNodes = nodes.map((n) => {
            if (n.id !== id) return n;
            return {
                ...n,
                data: {
                    ...n.data,
                    attributes: n.data.attributes.filter(
                        (a) => a.id !== attributeId
                    ),
                },
            };
        });

        set({
            nodes: newNodes,
        });

        saveDiagram(newNodes, edges);
    },
    updateEntityName(id: string, newName: string) {
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        let saving = true;

        const newNodes = nodes.map((n) => {
            if (n.id !== id) return n;
            if (n.data.name === newName) {
                saving = false;
            }
            return {
                ...n,
                data: {
                    ...n.data,
                    name: newName,
                },
            };
        });

        if (saving && isReadOnly) {
            openReadOnlyModal();
            return;
        }

        set({
            nodes: newNodes,
        });

        if (saving) {
            saveDiagram(newNodes, edges);
        }
    },
    handleForeignKeyConstraint(
        oldForeignKey: string,
        foreignKey: string,
        reference: string,
        onDelete: string,
        onUpdate: string
    ) {
        const { selectedEdgeId, nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        const [oldForeignKeyTable, oldForeignKeyColumn] =
            oldForeignKey.split(".");
        const [foreignKeyTable, foreignKeyColumn] = foreignKey.split(".");
        const [referenceTable, referenceColumn] = reference.split(".");

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const newEdges = edges.map((e) => {
            if (e.id === selectedEdgeId) {
                return {
                    ...e,
                    data: {
                        ...e.data,
                        primaryKeyColumn: referenceColumn,
                        primaryKeyTable: referenceTable,
                        foreignKeyColumn,
                        foreignKeyTable,
                        onDelete,
                        onUpdate,
                    } as ErdEdgeData,
                };
            }
            return e;
        });

        const newNodes = nodes.map((n) => {
            if (n.data.name === oldForeignKeyTable) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        attributes: n.data.attributes.map((a) => {
                            if (a.name !== oldForeignKeyColumn) return a;
                            return {
                                ...a,
                                isForeignKey: false,
                            };
                        }),
                    },
                };
            }
            if (n.data.name === foreignKeyTable) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        attributes: n.data.attributes.map((a) => {
                            if (a.name !== foreignKeyColumn) return a;
                            return {
                                ...a,
                                isForeignKey: true,
                            };
                        }),
                    },
                };
            }
            return n;
        });

        set({
            nodes: newNodes,
            edges: newEdges,
        });

        saveDiagram(newNodes, newEdges);
    },
}));
export default useErdStore;
