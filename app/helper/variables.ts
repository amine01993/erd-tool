import { QueryClient } from "@tanstack/react-query";
import { initialAttributeFormState } from "../hooks/AttributeForm";
import { DiagramData } from "../type/DiagramType";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 48,
        },
    },
});

export const defaultAttributeValues = initialAttributeFormState.values;

export const defaultDiagramValues: DiagramData = {
    id: "",
    name: "",
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    loaded: false,
    history: {
        current: 0,
        states: [],
    },
};

export const defaultEdgeDataValues = {
    order: 0,
    length: 0,
    startValue: "",
    endValue: "",
};

export const defaultEdgeValues = {
    id: "",
    source: "",
    target: "",
    markerStart: null,
    markerEnd: null,
    data: {
        ...defaultEdgeDataValues,
    },
};

export const defaultNodeValues = {
    id: "",
    data: {
        name: "",
        attributes: [],
    },
    position: { x: 0, y: 0 },
    type: "entity",
};

export const defaultEdgeOptions = {
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
