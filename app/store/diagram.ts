import { create } from "zustand";
import { Node, Edge, Viewport } from "@xyflow/react";
import { UseMutationResult } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import useErdStore from "./erd";
import useUserStore from "./user";
import {
    DiagramCategory,
    DiagramData,
    DiagramDataUpdate,
} from "../type/DiagramType";
import { ErdEdgeData } from "../type/EdgeType";
import { EntityData } from "../type/EntityType";
import { defaultAttributeValues, queryClient } from "../helper/variables";
import {
    getDiagramsCategoryFromLocalStorage,
    getDiagramsFromLocalStorage,
} from "../helper/utils";

type DiagramMutationVariables = UseMutationResult<
    void,
    Error,
    DiagramDataUpdate,
    unknown
>;

interface DiagramStoreProps {
    category: DiagramCategory;
    clientOnly: boolean;
    persisting: number;
    persistingViewport: number;
    refreshing: boolean;
    loading: boolean;
    syncing: boolean;
    diagrams: DiagramData[];
    selectedDiagram: string;
    selectDiagram: (id: string) => void;
    getSelectedDiagram: () => DiagramData | undefined;
    getName: (prefix?: string, nbr?: number) => string;
    startSyncing: () => void;
    endSyncing: () => void;
    startRefreshing: () => void;
    endRefreshing: () => void;
    setCategory: (category: DiagramCategory) => void;
    loadDiagram: () => Promise<any>;
    loadDiagrams: (
        mutation: UseMutationResult<void, Error, DiagramData, unknown>
    ) => Promise<void>;
    createDiagram: (
        mutation: UseMutationResult<void, Error, DiagramData, unknown>
    ) => void;
    duplicateDiagram: (
        mutation: UseMutationResult<void, Error, DiagramData, unknown>
    ) => void;
    saveDiagram: (
        nodes: Node<EntityData>[],
        edges: Edge<ErdEdgeData>[]
    ) => void;
    saveViewport: (viewport: Viewport) => void;
    updateDiagramName: (
        mutation: DiagramMutationVariables,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>,
        name: string
    ) => Promise<{ isValid: boolean; message: string } | void>;
    deleteDiagram: (
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>
    ) => Promise<void>;
    deleteDiagramPermanently: (
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >
    ) => Promise<void>;
    recoverDiagram: (
        mutation: UseMutationResult<void, Error, string, unknown>
    ) => Promise<void>;
    undoAction: () => void;
    redoAction: () => void;
    hasDeleteHaveAddCachedMutation: (id: string) => DiagramData | null;
    hasUpdateHaveAddCachedMutation: (
        updateData: DiagramDataUpdate
    ) => DiagramData | null;
    handleCachedMutations: (updateData: DiagramDataUpdate) => DiagramDataUpdate;
    persistNewDiagram: (
        mutation: UseMutationResult<void, Error, DiagramData, unknown>,
        newDiagram: DiagramData
    ) => Promise<void>;
    persistDiagram: (
        mutation: DiagramMutationVariables,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>
    ) => Promise<void>;
    persistDiagramViewport: (
        mutation: DiagramMutationVariables,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>
    ) => Promise<void>;
    persistDiagramName: (
        mutation: DiagramMutationVariables,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>,
        name: string
    ) => Promise<{ isValid: boolean; message: string } | void>;
    persistDiagramDelete: (
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>,
        id: string
    ) => Promise<void>;
    persistDiagramDeletePermanently: (
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >,
        id: string
    ) => Promise<void>;
    persistDiagramRecover: (
        mutation: UseMutationResult<void, Error, string, unknown>,
        id: string
    ) => Promise<void>;
    emptyDiagrams: () => void;
    cloneDiagram: (d: DiagramData) => DiagramData;
}

const useDiagramStore = create<DiagramStoreProps>()((set, get) => ({
    // current category of diagrams being viewed
    category: getDiagramsCategoryFromLocalStorage(),
    // was diagrams data client only or not
    clientOnly: true,
    // persisting and persistingViewport are used for throttling API calls
    persisting: 0,
    persistingViewport: 0,
    refreshing: false,
    loading: false,
    syncing: false,
    diagrams: getDiagramsFromLocalStorage(),
    selectedDiagram: "",
    selectDiagram(id: string) {
        const { selectedDiagram } = get();
        const { clearSelection } = useErdStore.getState();
        if (selectedDiagram === id) return;
        console.log("selectDiagram:", id);

        set({
            selectedDiagram: id,
        });
        clearSelection();
    },
    getSelectedDiagram() {
        const { selectedDiagram, diagrams } = get();
        const diagram = diagrams.find((d) => d.id === selectedDiagram);
        return diagram;
    },
    startRefreshing() {
        set({ refreshing: true });
    },
    endRefreshing() {
        set({ refreshing: false });
    },
    startSyncing() {
        set({ syncing: true });
    },
    endSyncing() {
        set({ syncing: false });
    },
    setCategory(category: DiagramCategory) {
        set({ category });
        localStorage.setItem("diagrams-category", category);
    },
    async loadDiagram() {
        const { diagrams, getSelectedDiagram } = get();
        const { offLine, apiCall } = useUserStore.getState();
        const { setErd } = useErdStore.getState();

        const currentDiagram = getSelectedDiagram();
        if (!currentDiagram) return;
        else if (currentDiagram.loaded) {
            setErd(currentDiagram);
            return currentDiagram;
        }

        if (!offLine && !currentDiagram.loaded) {
            set({
                loading: true,
            });
            const response = await apiCall({
                method: "GET",
                query: { id: currentDiagram.id },
            });
            const diagram = await response.json();
            set({
                loading: false,
                diagrams: diagrams.map((d) => {
                    if (d.id === currentDiagram.id) {
                        return {
                            ...diagram,
                            loaded: true,
                        };
                    }
                    return d;
                }),
            });
            setErd(diagram);
            return diagram;
        }
    },
    async loadDiagrams(
        mutation: UseMutationResult<void, Error, DiagramData, unknown>
    ) {
        const { apiCall } = useUserStore.getState();
        const { category, clientOnly, diagrams, createDiagram } = get();
        console.log("loadDiagrams called", { clientOnly, diagrams });

        if (!clientOnly && diagrams.length > 0) return;

        let _diagrams: DiagramData[] = [];

        const response = await apiCall({
            query: category === "deleted" ? { deleted: "1" } : {},
        });
        _diagrams = await response.json();
        _diagrams.forEach((d) => {
            d.loaded = false;
        });

        let chosenDiagram: DiagramData | undefined;
        if (_diagrams.length > 0) {
            chosenDiagram = _diagrams[0];
            for (const d of _diagrams) {
                if (d.lastUpdate > chosenDiagram.lastUpdate) {
                    chosenDiagram = d;
                }
            }
        }

        const newDiagrams = _diagrams;
        set({
            clientOnly: false,
            refreshing: false,
            diagrams: newDiagrams,
            selectedDiagram: chosenDiagram?.id ?? "",
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));
        localStorage.setItem("diagrams-category", category);

        if (newDiagrams.length === 0) {
            createDiagram(mutation);
        }
    },
    emptyDiagrams() {
        set({
            diagrams: [],
            selectedDiagram: "",
        });
        localStorage.removeItem("diagrams");
        localStorage.removeItem("diagrams-category");
    },
    getName: (prefix?: string, nbr?: number) => {
        const { diagrams } = get();
        prefix = prefix ?? "Erd Diagram";
        let k = nbr ?? 1,
            name = "";
        do {
            name = `${prefix} (${k++})`;
        } while (diagrams.some((diagram) => diagram.name === name));

        return name;
    },

    undoAction() {
        const {
            selectedDiagram,

            persisting,
            diagrams,
            cloneDiagram,
        } = get();
        const disableUndo = disableUndoSelector(get());
        const { setErd } = useErdStore.getState();

        if (disableUndo) return;

        let diagram: DiagramData | undefined;
        const newDiagrams = diagrams.map((d) => {
            if (d.id !== selectedDiagram) return d;
            const cd = cloneDiagram(d);
            diagram = cd;
            if (cd.history.current > 0) {
                cd.history.current--;
            }
            return cd;
        });

        set({
            diagrams: newDiagrams,
            persisting: persisting + 1,
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));

        if (diagram) {
            setErd(diagram);
        }
    },
    redoAction() {
        const { selectedDiagram, persisting, diagrams, cloneDiagram } = get();
        const disableRedo = disableRedoSelector(get());
        const { setErd } = useErdStore.getState();

        if (disableRedo) return;

        let diagram: DiagramData | undefined;
        const newDiagrams = diagrams.map((d) => {
            if (d.id !== selectedDiagram) return d;
            const cd = cloneDiagram(d);
            diagram = cd;
            if (cd.history.current < cd.history.states.length - 1) {
                cd.history.current++;
            }
            return cd;
        });

        set({
            diagrams: newDiagrams,
            persisting: persisting + 1,
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));

        if (diagram) {
            setErd(diagram);
        }
    },
    createDiagram(
        mutation: UseMutationResult<void, Error, DiagramData, unknown>
    ) {
        const { category, diagrams, getName, persistNewDiagram } = get();

        if (category === "deleted") return;

        let name = getName();

        const newDiagram: DiagramData = {
            id: nanoid(7),
            name,
            viewport: {
                x: 0,
                y: 0,
                zoom: 1,
            },
            createAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            loaded: true,
            history: {
                current: 0,
                states: [
                    {
                        nodes: [
                            {
                                id: nanoid(5),
                                data: {
                                    name: "Entity",
                                    attributes: [
                                        {
                                            ...defaultAttributeValues,
                                            id: nanoid(5),
                                            name: "id",
                                            type: "integer",
                                            isPrimaryKey: true,
                                            isAutoIncrement: true,
                                        },
                                        {
                                            ...defaultAttributeValues,
                                            id: nanoid(5),
                                            name: "name",
                                            type: "string",
                                            length: 30,
                                        },
                                    ],
                                },
                                position: { x: 0, y: 0 },
                                type: "entity",
                            },
                        ],
                        edges: [],
                    },
                ],
            },
        };

        const newDiagrams = [...diagrams, newDiagram];
        set({
            diagrams: newDiagrams,
            selectedDiagram: newDiagram.id,
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));

        persistNewDiagram(mutation, newDiagram);
    },
    duplicateDiagram(
        mutation: UseMutationResult<void, Error, DiagramData, unknown>
    ) {
        const {
            category,
            loading,
            diagrams,
            getSelectedDiagram,
            cloneDiagram,
            getName,
            persistNewDiagram,
        } = get();

        if (loading || category === "deleted") return;

        const currentDiagram = getSelectedDiagram();

        if (!currentDiagram || !currentDiagram.loaded) return;

        const newDiagram: DiagramData = cloneDiagram(currentDiagram);
        newDiagram.id = nanoid(7);
        const match = currentDiagram.name.match(/\((\d+?)\)$/i);

        let prefix = match
            ? currentDiagram.name.slice(0, match.index)
            : currentDiagram.name;
        let nbr = match ? parseInt(match[1]) : undefined;
        newDiagram.name = getName(prefix.trim(), nbr);

        newDiagram.lastUpdate = new Date().toISOString();

        const newDiagrams = [...diagrams, newDiagram];
        set({
            diagrams: newDiagrams,
            selectedDiagram: newDiagram.id,
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));

        persistNewDiagram(mutation, newDiagram);
    },
    saveDiagram(nodes: Node<EntityData>[], edges: Edge<ErdEdgeData>[]) {
        const { persisting, selectedDiagram, diagrams, cloneDiagram } = get();
        let diagram: DiagramData | undefined;
        const newDiagrams = diagrams.map((d) => {
            if (d.id !== selectedDiagram) return d;
            const cd = cloneDiagram(d);
            diagram = cd;
            if (cd.history.current === cd.history.states.length - 1) {
                cd.history.states.push({
                    nodes,
                    edges,
                });
            } else {
                cd.history.states = cd.history.states.slice(
                    0,
                    cd.history.current + 1
                );
                cd.history.states.push({
                    nodes,
                    edges,
                });
            }
            cd.history.current = cd.history.states.length - 1;
            cd.lastUpdate = new Date().toISOString();
            return cd;
        });

        set({
            persisting: persisting + 1,
            diagrams: newDiagrams,
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));
    },
    saveViewport(viewport: Viewport) {
        const {
            persistingViewport,
            diagrams,
            getSelectedDiagram,
            cloneDiagram,
        } = get();
        const isReadOnly = isReadOnlySelector(get());

        const currentDiagram = getSelectedDiagram();

        if (
            (currentDiagram?.viewport.x === viewport.x &&
                currentDiagram?.viewport.y === viewport.y &&
                currentDiagram?.viewport.zoom === viewport.zoom) ||
            isReadOnly
        ) {
            return;
        }

        const newDiagrams = diagrams.map((d) => {
            if (d.id !== currentDiagram?.id) return d;
            const cd = cloneDiagram(d);
            cd.viewport = viewport;
            return cd;
        });

        set({
            persistingViewport: persistingViewport + 1,
            diagrams: newDiagrams,
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));
    },
    async updateDiagramName(
        mutation: DiagramMutationVariables,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>,
        name: string
    ) {
        const { selectedDiagram, diagrams, persistDiagramName } = get();
        if (name === "")
            return { isValid: false, message: "Name cannot be empty" };

        const diagram = diagrams.find(
            (d) => selectedDiagram !== d.id && d.name === name
        );
        if (diagram) {
            return { isValid: false, message: "Name already exists" };
        }

        const newDiagrams = diagrams.map((d) => {
            if (d.id === selectedDiagram) {
                return {
                    ...d,
                    name,
                };
            }
            return d;
        });
        set({
            diagrams: newDiagrams as DiagramData[],
        });
        localStorage.setItem("diagrams", JSON.stringify(newDiagrams));

        persistDiagramName(mutation, mutationAdd, name).then((data) => {
            if (data) {
                Promise.resolve(data);
            }
        });
    },
    async deleteDiagram(
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>
    ) {
        const { loading, diagrams, selectedDiagram, persistDiagramDelete } =
            get();

        if (loading || selectedDiagram === "") return;

        const newDiagrams = diagrams.filter((d) => d.id !== selectedDiagram);
        let newSelectedDiagram = "";

        if (newDiagrams.length === 0) {
            set({
                diagrams: [],
            });
            localStorage.removeItem("diagrams");
        } else {
            let currentDiagram = newDiagrams[0];
            for (const d of newDiagrams) {
                if (currentDiagram.lastUpdate < d.lastUpdate) {
                    currentDiagram = d;
                }
            }
            newSelectedDiagram = currentDiagram.id;
            set({
                selectedDiagram: newSelectedDiagram,
                diagrams: newDiagrams,
            });
            localStorage.setItem("diagrams", JSON.stringify(newDiagrams));
        }

        persistDiagramDelete(mutation, mutationAdd, selectedDiagram);
    },
    async deleteDiagramPermanently(
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >
    ) {
        const {
            loading,
            diagrams,
            selectedDiagram,
            persistDiagramDeletePermanently,
        } = get();

        if (loading || selectedDiagram === "") return;

        const newDiagrams = diagrams.filter((d) => d.id !== selectedDiagram);
        let newSelectedDiagram = "";

        if (newDiagrams.length === 0) {
            set({
                diagrams: [],
            });
            localStorage.removeItem("diagrams");
        } else {
            let currentDiagram = newDiagrams[0];
            for (const d of newDiagrams) {
                if (
                    ((!currentDiagram.deletedAt || !d.deletedAt) &&
                        currentDiagram.lastUpdate < d.lastUpdate) ||
                    (currentDiagram.deletedAt &&
                        d.deletedAt &&
                        currentDiagram.deletedAt < d.deletedAt)
                ) {
                    currentDiagram = d;
                }
            }
            newSelectedDiagram = currentDiagram.id;
            set({
                selectedDiagram: newSelectedDiagram,
                diagrams: newDiagrams,
            });
            localStorage.setItem("diagrams", JSON.stringify(newDiagrams));
        }

        await persistDiagramDeletePermanently(mutation, selectedDiagram);
    },
    async recoverDiagram(
        mutation: UseMutationResult<void, Error, string, unknown>
    ) {
        const {
            category,
            loading,
            diagrams,
            selectedDiagram,
            persistDiagramRecover,
        } = get();

        if (category === "all" || loading || selectedDiagram === "") return;

        const newDiagrams = diagrams.filter((d) => d.id !== selectedDiagram);
        let newSelectedDiagram = "";

        if (newDiagrams.length === 0) {
            set({
                diagrams: [],
            });
            localStorage.removeItem("diagrams");
        } else {
            let currentDiagram = newDiagrams[0];
            for (const d of newDiagrams) {
                if (
                    ((!currentDiagram.deletedAt || !d.deletedAt) &&
                        currentDiagram.lastUpdate < d.lastUpdate) ||
                    (currentDiagram.deletedAt &&
                        d.deletedAt &&
                        currentDiagram.deletedAt < d.deletedAt)
                ) {
                    currentDiagram = d;
                }
            }
            newSelectedDiagram = currentDiagram.id;
            set({
                selectedDiagram: newSelectedDiagram,
                diagrams: newDiagrams,
            });
            localStorage.setItem("diagrams", JSON.stringify(newDiagrams));
        }

        persistDiagramRecover(mutation, selectedDiagram);
    },
    hasDeleteHaveAddCachedMutation(id: string) {
        const mutationCache = queryClient.getMutationCache();
        const mutations = mutationCache.getAll();

        // when an add-diagram mutation is detected before a delete mutation then set the deleteAt Attribute
        // let hasAddMutation = false;
        for (const m of mutations) {
            const { mutationKey } = m.options;
            const data = m.state.variables as any;
            if (mutationKey?.[0] === "add-diagram" && data.id === id) {
                // hasAddMutation = true;
                mutationCache.remove(m);
                return data;
            }
        }

        return null;
    },
    hasUpdateHaveAddCachedMutation(updateData: DiagramDataUpdate) {
        const mutationCache = queryClient.getMutationCache();
        const mutations = mutationCache.getAll();

        const addMutation = mutations.find((m) => {
            const { mutationKey } = m.options;
            const data = m.state.variables as any;
            return (
                mutationKey?.[0] === "add-diagram" && data.id === updateData.id
            );
        });

        if (addMutation) {
            mutationCache.remove(addMutation);
            let newData = addMutation.state.variables as DiagramData;
            const newUpdateData = {
                ...updateData,
            };
            mutations.forEach((m) => {
                const { mutationKey } = m.options;
                const data = m.state.variables as any;
                if (
                    data.id === updateData.id &&
                    mutationKey?.[0] === "update-diagram"
                ) {
                    mutationCache.remove(m);
                    if (newUpdateData.name === undefined)
                        newUpdateData.name = data.name;
                    if (newUpdateData.history === undefined)
                        newUpdateData.history = data.history;
                    if (newUpdateData.viewport === undefined)
                        newUpdateData.viewport = data.viewport;
                }
            });

            newData = {
                ...newData,
                ...newUpdateData,
            };
            return newData;
        }

        return null;
    },
    handleCachedMutations(updateData: DiagramDataUpdate) {
        const mutationCache = queryClient.getMutationCache();
        // Inspect queued mutations
        const mutations = mutationCache.getAll();

        // Cancel update mutations for the selected diagram and merge its data
        const newUpdateData = {
            ...updateData,
        };
        mutations.forEach((m) => {
            const { mutationKey } = m.options;
            const data = m.state.variables as any;
            if (
                mutationKey?.[0] === "update-diagram" &&
                data.id === updateData.id
            ) {
                mutationCache.remove(m);
                if (newUpdateData.name === undefined)
                    newUpdateData.name = data.name;
                if (newUpdateData.history === undefined)
                    newUpdateData.history = data.history;
                if (newUpdateData.viewport === undefined)
                    newUpdateData.viewport = data.viewport;
            }
        });

        return newUpdateData;
    },
    async persistNewDiagram(
        mutation: UseMutationResult<void, Error, DiagramData, unknown>,
        newDiagram: DiagramData
    ) {
        mutation.mutate(newDiagram);
    },
    async persistDiagram(
        mutation: DiagramMutationVariables,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>
    ) {
        const {
            getSelectedDiagram,
            hasUpdateHaveAddCachedMutation,
            handleCachedMutations,
        } = get();

        const currentDiagram = getSelectedDiagram();
        if (currentDiagram) {
            const result = hasUpdateHaveAddCachedMutation({
                id: currentDiagram.id,
                history: currentDiagram.history,
            });

            if (result) {
                mutationAdd.mutate(result);
            } else {
                const updatedData = handleCachedMutations({
                    id: currentDiagram.id,
                    history: currentDiagram.history,
                });
                mutation.mutate(updatedData);
            }
        }

        set({
            persisting: 0,
        });
    },
    async persistDiagramViewport(
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; viewport?: DiagramData["viewport"] },
            unknown
        >,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>
    ) {
        const {
            getSelectedDiagram,
            hasUpdateHaveAddCachedMutation,
            handleCachedMutations,
        } = get();

        const currentDiagram = getSelectedDiagram();
        if (currentDiagram) {
            const result = hasUpdateHaveAddCachedMutation({
                id: currentDiagram.id,
                viewport: currentDiagram.viewport,
            });

            if (result) {
                mutationAdd.mutate(result);
            } else {
                const updatedData = handleCachedMutations({
                    id: currentDiagram.id,
                    viewport: currentDiagram.viewport,
                });
                mutation.mutate(updatedData);
            }
        }

        set({
            persistingViewport: 0,
        });
    },
    async persistDiagramName(
        mutation: UseMutationResult<
            void,
            Error,
            {
                id: string;
                name?: string;
            },
            unknown
        >,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>,
        name: string
    ): Promise<{ isValid: boolean; message: string } | void> {
        const {
            selectedDiagram,
            hasUpdateHaveAddCachedMutation,
            handleCachedMutations,
        } = get();

        const result = hasUpdateHaveAddCachedMutation({
            id: selectedDiagram,
            name: name,
        });

        if (result) {
            mutationAdd.mutateAsync(result).then(() => {
                Promise.resolve({
                    isValid: true,
                    message: "Name updated successfully",
                });
            });
        } else {
            const updatedData = handleCachedMutations({
                id: selectedDiagram,
                name: name,
            });
            mutation.mutateAsync(updatedData).then(() => {
                Promise.resolve({
                    isValid: true,
                    message: "Name updated successfully",
                });
            });
        }
    },
    async persistDiagramDelete(
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >,
        mutationAdd: UseMutationResult<void, Error, DiagramData, unknown>,
        id: string
    ) {
        const { hasDeleteHaveAddCachedMutation } = get();
        const data = hasDeleteHaveAddCachedMutation(id);

        if (data) {
            mutationAdd.mutate({
                ...data,
                deletedAt: new Date().toISOString(),
            });
        } else {
            mutation.mutate({ id });
        }
    },
    async persistDiagramDeletePermanently(
        mutation: UseMutationResult<
            void,
            Error,
            { id: string; perma?: boolean },
            unknown
        >,
        id: string
    ) {
        mutation.mutate({ id, perma: true });
    },
    async persistDiagramRecover(
        mutation: UseMutationResult<void, Error, string, unknown>,
        id: string
    ) {
        mutation.mutate(id);
    },
    cloneDiagram(d: DiagramData): DiagramData {
        return {
            ...d,
            viewport: { ...d.viewport },
            history: {
                ...d.history,
                states: d.history.states.map((s) => {
                    return {
                        nodes: s.nodes.map((n) => {
                            return {
                                ...n,
                                position: { ...n.position },
                                measured: { ...n.measured },
                                data: {
                                    ...n.data,
                                    attributes: n.data.attributes.map((a) => ({
                                        ...a,
                                    })),
                                } as EntityData,
                            };
                        }),
                        edges: s.edges.map((e) => {
                            return {
                                ...e,
                                data: {
                                    ...e.data,
                                } as ErdEdgeData,
                            };
                        }),
                    };
                }),
            },
        };
    },
}));

export default useDiagramStore;

export const isReadOnlySelector = (state: DiagramStoreProps) => {
    return state.category === "deleted";
};

export const currentDiagramSelector = (state: DiagramStoreProps) => {
    return state.diagrams.find((d) => d.id === state.selectedDiagram);
};

export const disableUndoSelector = (state: DiagramStoreProps) => {
    if (state.loading || state.selectedDiagram === "") return true;
    const currentDiagram = state.diagrams.find(
        (d) => d.id === state.selectedDiagram
    );
    if (!currentDiagram || !currentDiagram.loaded) return true;
    return currentDiagram.history.current <= 0;
};

export const disableRedoSelector = (state: DiagramStoreProps) => {
    if (state.loading || state.selectedDiagram === "") return true;
    const currentDiagram = state.diagrams.find(
        (d) => d.id === state.selectedDiagram
    );
    if (!currentDiagram || !currentDiagram.loaded) return true;
    return (
        currentDiagram.history.current >=
        currentDiagram.history.states.length - 1
    );
};
