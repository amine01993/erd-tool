
import {create} from "zustand";

type ErdItem = "selector" | "entity" | "edge";
export interface ErdItemsState {
    selectedItem: ErdItem;
    selectItem: (item: ErdItem) => void;
}

const useErdItemsStore = create<ErdItemsState>((set) => ({
    selectedItem: "selector",
    selectItem: (item) => set({ selectedItem: item }),
}));

export default useErdItemsStore;