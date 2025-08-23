import { QueryClient } from "@tanstack/react-query";
import { initialAttributeFormState } from "../hooks/AttributeForm";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 48,
        },
    },
});

export const defaultAttributeValues = initialAttributeFormState.values;

export const defaultDiagramValues = {
    id: "",
    name: "",
    viewport: { x: 0, y: 0, zoom: 1 },
    createAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    loaded: false,
    persisted: false,
    persistType: null,
    history: {
        current: 0,
        states: [],
    },
};

export const defaultEdgeValues = {
    id: "",
    source: "",
    target: "",
    markerStart: null,
    markerEnd: null,
    data: {
        order: 0,
        length: 0,
        startValue: "",
        endValue: "",
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