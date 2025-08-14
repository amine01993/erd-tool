import { ChangeEvent, memo } from "react";
import cc from "classcat";
import useUserStore, { AppTheme } from "@/app/store/user";
import { LightIcon, DarkIcon, OsDefault } from "./Theme";

const ThemeMenu = () => {
    const { theme, isThemeMenuOpen, setTheme } = useUserStore();

    const handleThemeChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log("handleThemeChange", e.target.value);
        setTheme(e.target.value as AppTheme);
    };

    return (
        <div className={cc(["theme-menu", { open: isThemeMenuOpen }])}>
            <label className={cc({ selected: theme === "system" })}>
                <input type="radio" name="theme-preference" value="system" onChange={handleThemeChange} />
                <OsDefault theme="light" fontSize={21} />
                System
            </label>
            <label className={cc({ selected: theme === "dark" })}>
                <input type="radio" name="theme-preference" value="dark" onChange={handleThemeChange} />
                <DarkIcon theme="light" fontSize={21} />
                Dark
            </label>
            <label className={cc({ selected: theme === "light" })}>
                <input type="radio" name="theme-preference" value="light" onChange={handleThemeChange} />
                <LightIcon theme="light" fontSize={21} />
                Light
            </label>
        </div>
    );
};

export default memo(ThemeMenu);
