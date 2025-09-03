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
import {
    EntityData,
    AttributeData,
    ErdSchema,
    ErdCompletionSchema,
} from "../type/EntityType";
import { ErdEdgeData } from "../type/EdgeType";
import {
    defaultAttributeValues,
    defaultEdgeOptions,
} from "../helper/variables";
import { getLayoutedElements } from "../helper/items";

export type ErdState = {
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    loaded: boolean;
    suggestionsAvailable: boolean;
    nodes: Node<EntityData>[];
    edges: Edge<ErdEdgeData>[];
    getMarkersName: (
        startVal: string,
        endVal: string
    ) => { markerStart: string; markerEnd: string };
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onEdgeHover: (edge: Edge<ErdEdgeData>, hovered: boolean) => void;
    onEdgeSelected: (
        edge: Edge<ErdEdgeData> | string,
        selected: boolean
    ) => void;
    getConnectedFromNode: (node: Node<EntityData>) => {
        nodes: Node<EntityData>[];
        edges: Edge<ErdEdgeData>[];
    };
    getConnectedFromEdge: (edge: Edge<ErdEdgeData>) => {
        nodes: Node<EntityData>[];
        edges: Edge<ErdEdgeData>[];
    };
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
        onUpdate: string,
        edgePosition: string
    ) => void;
    setErdFromSchema: (schema: ErdSchema) => void;
    autoCompleteSuggestion: (
        selected: { nodes: Node<EntityData>[]; edges: Edge<ErdEdgeData>[] },
        submit: (input: any) => void
    ) => void;
    setSuggestionsFromSchema: (schema: ErdCompletionSchema) => void;
    clearSuggestions: () => void;
    saveSuggestions: () => void;
};

const useErdStore = createWithEqualityFn<ErdState>((set, get) => ({
    selectedNodeId: null,
    selectedEdgeId: null,
    loaded: false,
    suggestionsAvailable: false,
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
        if (String(edge.markerStart).endsWith("-selected")) return;
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
    onEdgeSelected: (edge: Edge<ErdEdgeData> | string, selected: boolean) => {
        const { edges, getMarkersName } = get();
        let edg: Edge<ErdEdgeData> | undefined;

        if (typeof edge === "string") {
            if (!edge) return;
            edg = edges.find((e) => e.id === edge);
            if (!edg) return;
        } else {
            edg = edge;
        }

        if (edg.selected) return;

        if (edg.data) {
            let { markerStart, markerEnd } = getMarkersName(
                String(edg.data.startValue),
                String(edg.data.endValue)
            );
            if (selected) {
                markerStart += "-selected";
                markerEnd += "-selected";
            }
            set({
                edges: edges.map((e) => {
                    if (e.id !== edg.id) return e;
                    return {
                        ...edg,
                        markerStart,
                        markerEnd,
                    };
                }),
            });
        }
    },
    getConnectedFromNode: (node: Node<EntityData>) => {
        const { nodes, edges } = get();
        const connectedEdges = edges.filter(
            (e) => e.source === node.id || e.target === node.id
        );
        const connectedNodes = nodes.filter((n) =>
            connectedEdges.some((e) => e.source === n.id || e.target === n.id)
        );
        return {
            nodes: connectedNodes,
            edges: connectedEdges,
        };
    },
    getConnectedFromEdge: (edge: Edge<ErdEdgeData>) => {
        const { nodes } = get();
        const connectedNodes = nodes.filter(
            (n) => edge.source === n.id || edge.target === n.id
        );
        return {
            nodes: connectedNodes,
            edges: [edge],
        };
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
        onUpdate: string,
        edgePosition: string
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

        const edgeData = {
            primaryKeyColumn: referenceColumn,
            primaryKeyTable: referenceTable,
            foreignKeyColumn,
            foreignKeyTable,
            onDelete,
            onUpdate,
        } as ErdEdgeData;
        if (edgePosition) {
            edgeData.edgePosition = edgePosition;
        }

        const newEdges = edges.map((e) => {
            if (e.id === selectedEdgeId) {
                return {
                    ...e,
                    data: {
                        ...e.data,
                        ...edgeData,
                    },
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
    setErdFromSchema(schema: ErdSchema) {
        const { nodes, edges, getMarkersName } = get();
        const { saveDiagram } = useDiagramStore.getState();
        const { openReadOnlyModal } = useUserStore.getState();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            openReadOnlyModal();
            return;
        }

        const newNodes = schema.nodes
            .map((entity) => {
                const existingNode = nodes.find(
                    (n) => n.data.name === entity.name
                );
                return {
                    ...(existingNode || {}),
                    id: nanoid(),
                    type: "entity",
                    origin: [0.5, 0.0],
                    data: {
                        ...(existingNode?.data || {}),
                        name: entity.name,
                        attributes: (entity.attributes || []).map((attr) => ({
                            ...defaultAttributeValues,
                            id: nanoid(),
                            name: attr.name,
                            type: attr.type,
                            isPrimaryKey: attr.isPrimaryKey,
                            isNullable: attr.isNullable,
                            defaultValue: attr.defaultValue,
                            isCurrent: attr.isCurrent,
                            isAutoIncrement: attr.isAutoIncrement,
                            isUnique: attr.isUnique,
                            length: attr.length,
                            precision: attr.precision,
                            scale: attr.scale,
                            description: attr.description,
                            isUnicode: attr.isUnicode,
                        })),
                    },
                };
            })
            .filter((n) => n.data.name) as Node<EntityData>[];

        const newEdges: Edge<ErdEdgeData>[] = [];

        schema.edges.forEach((edge) => {
            if (
                !edge.source ||
                !edge.foreignKey ||
                !edge.references ||
                !edge.relationship ||
                !edge.references.entity ||
                !edge.references.attribute
            )
                return;

            const s = newNodes.find((n) => n.data.name === edge.source);
            const t = newNodes.find(
                (n) => n.data.name === edge.references.entity
            );

            if (!s || !t) return;

            const fk = (s.data.attributes || []).find(
                (a) => a.name === edge.foreignKey
            );
            if (fk) fk.isForeignKey = true;

            const [start, end] = edge.relationship.split("-");
            const startValue =
                start === "one" ? "1" : start === "zero" ? "0..1" : "*";
            const endValue =
                end === "one" ? "1" : end === "zero" ? "0..1" : "*";
            const { markerStart, markerEnd } = getMarkersName(
                startValue,
                endValue
            );

            newEdges.push({
                id: nanoid(),
                source: s.id,
                target: t.id,
                type: "erd-edge",
                markerStart,
                markerEnd,
                data: {
                    ...defaultEdgeOptions.data,
                    startValue,
                    endValue,
                    primaryKeyColumn: edge.references.attribute,
                    primaryKeyTable: edge.references.entity,
                    foreignKeyColumn: edge.foreignKey,
                    foreignKeyTable: edge.source,
                },
            });
        });

        nodes.forEach((n) => {
            const existingNode = newNodes.find(
                (nn) => nn.data.name === n.data.name
            );
            if (!existingNode) {
                newNodes.push(n);
            }
        });

        edges.forEach((e) => {
            const existingEdge = newEdges.find(
                (ne) =>
                    ne.source === e.source &&
                    ne.target === e.target &&
                    ne.data?.primaryKeyColumn === e.data?.primaryKeyColumn &&
                    ne.data?.primaryKeyTable === e.data?.primaryKeyTable &&
                    ne.data?.foreignKeyColumn === e.data?.foreignKeyColumn &&
                    ne.data?.foreignKeyTable === e.data?.foreignKeyTable
            );
            if (!existingEdge) {
                newEdges.push(e);
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(newNodes, newEdges);

        set({
            nodes: layoutedNodes,
            edges: layoutedEdges,
        });

        saveDiagram(layoutedNodes, layoutedEdges);
    },
    autoCompleteSuggestion(
        selected: { nodes: Node<EntityData>[]; edges: Edge<ErdEdgeData>[] },
        submit: (input: any) => void
    ) {
        const { nodes, edges } = get();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            return;
        }

        submit({
            selectedNodes: selected.nodes.map((n) => n.data.name),
            selectedEdges: selected.edges.map((e) => {
                const data = {
                    source: e.data?.primaryKeyTable,
                    foreignKey: e.data?.foreignKeyColumn,
                    references: {
                        entity: e.data?.primaryKeyTable,
                        attribute: e.data?.primaryKeyColumn,
                    },
                };
                if(!data.source) delete data.source;
                if(!data.foreignKey) delete data.foreignKey;
                if(!data.references.entity) delete data.references.entity;
                if(!data.references.attribute) delete data.references.attribute;
                return data;
            }),
            nodes: nodes.map((n) => n.data),
            edges: edges
                .map((e) => {
                    if (
                        !e.data?.foreignKeyColumn ||
                        !e.data?.foreignKeyTable ||
                        !e.data?.primaryKeyColumn ||
                        !e.data?.primaryKeyTable ||
                        !e.data?.startValue ||
                        !e.data?.endValue
                    )
                        return null;

                    const start =
                        e.data.startValue === "1"
                            ? "one"
                            : e.data.startValue === "0..1"
                            ? "zero"
                            : "many";
                    const end =
                        e.data.endValue === "1"
                            ? "one"
                            : e.data.endValue === "0..1"
                            ? "zero"
                            : "many";

                    return {
                        source: e.data.primaryKeyTable,
                        foreignKey: e.data.foreignKeyColumn,
                        references: {
                            entity: e.data.primaryKeyTable,
                            attribute: e.data.primaryKeyColumn,
                        },
                        relationship: start + "-to-" + end,
                    };
                })
                .filter((e) => e !== null),
        });
    },
    setSuggestionsFromSchema(schema: ErdCompletionSchema) {
        const { nodes, edges, getMarkersName } = get();
        const isReadOnly = isReadOnlySelector(useDiagramStore.getState());

        if (isReadOnly) {
            return;
        }

        const newNodes: Node<EntityData>[] = [];

        schema.nodes.forEach((entity) => {
            const existingNode = nodes.find((n) => n.data.name === entity.name);
            if (existingNode) {
                const newNode = {
                    ...existingNode,
                    data: {
                        ...existingNode.data,
                        attributes: existingNode.data.attributes.map((a) => ({
                            ...a,
                        })),
                    },
                };

                entity.attributes.forEach((attr) => {
                    const existingAttribute = existingNode.data.attributes.find(
                        (a) => a.name === attr.name
                    );
                    if (existingAttribute) return;

                    newNode.data.attributes.push({
                        ...defaultAttributeValues,
                        id: nanoid(),
                        ...attr,
                        isSuggestion: true,
                    });
                });

                newNodes.push(newNode);
            } else {
                const newNode: Node<EntityData> = {
                    id: nanoid(),
                    type: "entity",
                    origin: [0.5, 0.0],
                    position: { x: 0, y: 0 },
                    data: {
                        name: entity.name,
                        attributes: (entity.attributes || []).map((attr) => ({
                            ...defaultAttributeValues,
                            ...attr,
                            id: nanoid(),
                        })),
                        isSuggestion: true,
                    },
                };
                newNodes.push(newNode);
            }
        });

        nodes.forEach((n) => {
            const existingNode = newNodes.find(
                (nn) => nn.data.name === n.data.name
            );
            if (!existingNode) {
                newNodes.push(n);
            }
        });

        const newEdges: Edge<ErdEdgeData>[] = [];

        schema.edges?.forEach((edge) => {
            if (
                !edge.source ||
                !edge.foreignKey ||
                !edge.references ||
                !edge.relationship ||
                !edge.references.entity ||
                !edge.references.attribute
            )
                return;

            const s = newNodes.find((n) => n.data.name === edge.source);
            const t = newNodes.find(
                (n) => n.data.name === edge.references.entity
            );

            if (!s || !t) return;

            const fk = (s.data.attributes || []).find(
                (a) => a.name === edge.foreignKey
            );
            if (fk) fk.isForeignKey = true;
            else {
                s.data.attributes.push({
                    ...defaultAttributeValues,
                    id: nanoid(),
                    type: "integer",
                    name: edge.foreignKey,
                    isForeignKey: true,
                    isSuggestion: true,
                });
            }

            const [start, end] = edge.relationship.split("-");
            const startValue =
                start === "one" ? "1" : start === "zero" ? "0..1" : "*";
            const endValue =
                end === "one" ? "1" : end === "zero" ? "0..1" : "*";
            const { markerStart, markerEnd } = getMarkersName(
                startValue,
                endValue
            );

            newEdges.push({
                id: nanoid(),
                source: s.id,
                target: t.id,
                type: "erd-edge",
                markerStart,
                markerEnd,
                data: {
                    ...defaultEdgeOptions.data,
                    startValue,
                    endValue,
                    primaryKeyColumn: edge.references.attribute,
                    primaryKeyTable: edge.references.entity,
                    foreignKeyColumn: edge.foreignKey,
                    foreignKeyTable: edge.source,
                    isSuggestion: true,
                },
            });
        });

        edges.forEach((e) => {
            const existingEdge = newEdges.find(
                (ne) =>
                    ne.data?.primaryKeyColumn === e.data?.primaryKeyColumn &&
                    ne.data?.primaryKeyTable === e.data?.primaryKeyTable &&
                    ne.data?.foreignKeyColumn === e.data?.foreignKeyColumn &&
                    ne.data?.foreignKeyTable === e.data?.foreignKeyTable
            );
            if (!existingEdge) {
                newEdges.push(e);
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(
                newNodes,
                newEdges,
                // new Set(nodes.map((n) => n.id))
            );

        set({
            nodes: layoutedNodes,
            edges: newEdges,
            suggestionsAvailable: true,
        });
    },
    clearSuggestions() {
        const { nodes, edges } = get();

        const newNodes = nodes
            .map((n) => {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        attributes: n.data.attributes
                            .map((a) => ({
                                ...a,
                            }))
                            .filter((a) => !a.isSuggestion),
                    },
                };
            })
            .filter((n) => !n.data.isSuggestion);

        const newEdges = edges
            .map((e) => {
                return {
                    ...e,
                    data: {
                        ...e.data,
                    } as ErdEdgeData,
                };
            })
            .filter((e) => !e.data.isSuggestion);

        set({
            nodes: newNodes,
            edges: newEdges,
            suggestionsAvailable: false,
        });
    },
    saveSuggestions() {
        const { nodes, edges } = get();
        const { saveDiagram } = useDiagramStore.getState();

        const newNodes = nodes.map((n) => {
            return {
                ...n,
                data: {
                    ...n.data,
                    isSuggestion: false,
                    attributes: n.data.attributes.map((a) => ({
                        ...a,
                        isSuggestion: false,
                    })),
                },
            };
        });
        const newEdges = edges.map((e) => {
            return {
                ...e,
                data: {
                    ...e.data,
                    isSuggestion: false,
                } as ErdEdgeData,
            };
        });

        set({
            nodes: newNodes,
            edges: newEdges,
            suggestionsAvailable: false,
        });

        saveDiagram(newNodes, newEdges);
    },
}));
export default useErdStore;
