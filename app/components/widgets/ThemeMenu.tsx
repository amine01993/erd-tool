import { ChangeEvent, memo } from "react";
import cc from "classcat";
import useUserStore, { AppTheme, themeSelector } from "@/app/store/user";
import { LightIcon, DarkIcon, OsDefault } from "./Theme";
import useUpdateUserAttribute from "@/app/hooks/UserAttributeUpdate";
import useComputedTheme from "@/app/hooks/ComputedTheme";

const ThemeMenu = () => {
    const theme = useUserStore(themeSelector);
    const isThemeMenuOpen = useUserStore((state) => state.isThemeMenuOpen);
    const setTheme = useUserStore((state) => state.setTheme);
    const computedTheme = useComputedTheme();
    const mutationUpdateUserAttribute = useUpdateUserAttribute();

    const handleThemeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTheme(e.target.value as AppTheme, mutationUpdateUserAttribute);
    };

    return (
        <div className={cc(["theme-menu", { open: isThemeMenuOpen }])}>
            <label className={cc({ selected: theme === "system" })}>
                <input
                    type="radio"
                    name="theme-preference"
                    value="system"
                    onChange={handleThemeChange}
                />
                <OsDefault theme={computedTheme} props={{ fontSize: 21 }} />
                System
            </label>
            <label className={cc({ selected: theme === "dark" })}>
                <input
                    type="radio"
                    name="theme-preference"
                    value="dark"
                    onChange={handleThemeChange}
                />
                <DarkIcon props={{ fontSize: 21 }} />
                Dark
            </label>
            <label className={cc({ selected: theme === "light" })}>
                <input
                    type="radio"
                    name="theme-preference"
                    value="light"
                    onChange={handleThemeChange}
                />
                <LightIcon props={{ fontSize: 21 }} />
                Light
            </label>
        </div>
    );
};

export default memo(ThemeMenu);
