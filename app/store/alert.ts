import { create } from "zustand";

interface AlertState {
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
    showToast: (message: string, type: AlertState["type"]) => void;
    hideToast: () => void;
}

const useAlertStore = create<AlertState>((set, get) => ({
    message: "",
    type: "error",
    isVisible: false,
    showToast: (message, type) => set({ message, type, isVisible: true }),
    hideToast: () => set({ isVisible: false }),
}));

export default useAlertStore;
