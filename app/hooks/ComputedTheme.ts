import { useEffect, useMemo, useState } from "react";
import useUserStore, { themeSelector } from "../store/user";

const useComputedTheme = () => {
    const theme = useUserStore(themeSelector);
    const [isDark, setIsDark] = useState(false);

    const computedTheme = useMemo(() => {
        if (theme === "system") {
            return isDark ? "dark" : "light";
        }
        return theme;
    }, [theme, isDark]);

    useEffect(() => {
        if (theme === "system") {
            document.body.classList.remove("dark", "light");
        } else {
            if (computedTheme === "dark") {
                document.body.classList.remove("light");
                document.body.classList.add("dark");
            } else {
                document.body.classList.remove("dark");
                document.body.classList.add("light");
            }
        }
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
                setIsDark(e.matches);
            });
    }, [computedTheme, theme]);

    useEffect(() => {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }, []);

    return computedTheme;
};

export default useComputedTheme;
