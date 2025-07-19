import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DiagramData {
    id: string;
    name: string;
    createAt: string;
    lastUpdate: string;
}

interface DiagramState {
    diagrams: DiagramData[];
}

const initialState: DiagramState = {
    diagrams: [],
}

const diagramSlice = createSlice({
    name: "diagram",
    initialState,
    reducers: {
        initDiagrams(state, action: PayloadAction<DiagramData[]>) {
            state.diagrams = action.payload;
        }
    },
});

export const { initDiagrams } = diagramSlice.actions

export default diagramSlice.reducer