import { create } from "zustand";

export type AppTheme = "system" | "dark" | "light";

export interface UserState {
    theme: AppTheme;
    isThemeMenuOpen: boolean;
    setTheme: (theme: AppTheme) => void;
    toggleThemeMenu: () => void;
    openThemeMenu: () => void;
    closeThemeMenu: () => void;
}

const useUserStore = create<UserState>((set, get) => ({
    theme: "system",
    isThemeMenuOpen: false,
    setTheme(theme: AppTheme) {
        set({ theme });
    },
    toggleThemeMenu() {
        set({
            isThemeMenuOpen: !get().isThemeMenuOpen,
        });
    },
    openThemeMenu() {
        set({
            isThemeMenuOpen: true,
        });
    },
    closeThemeMenu() {
        set({
            isThemeMenuOpen: false,
        });
    },
}));

export default useUserStore;
