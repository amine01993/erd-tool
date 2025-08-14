import { create } from "zustand";

export type AppTheme = "system" | "dark" | "light";

export interface UserState {
    theme: AppTheme;
    isThemeMenuOpen: boolean;
    isSettingsMenuOpen: boolean;
    setTheme: (theme: AppTheme) => void;
    toggleThemeMenu: () => void;
    openThemeMenu: () => void;
    closeThemeMenu: () => void;
    toggleSettingsMenu: () => void;
    openSettingsMenu: () => void;
    closeSettingsMenu: () => void;
}

const useUserStore = create<UserState>((set, get) => ({
    theme: "system",
    isThemeMenuOpen: false,
    isSettingsMenuOpen: false,
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
    toggleSettingsMenu() {
        set({
            isSettingsMenuOpen: !get().isSettingsMenuOpen,
        });
    },
    openSettingsMenu() {
        set({
            isSettingsMenuOpen: true,
        });
    },
    closeSettingsMenu() {
        set({
            isSettingsMenuOpen: false,
        });
    },
}));

export default useUserStore;
