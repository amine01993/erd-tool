import { memo, useCallback, useEffect, useMemo, useState } from "react";
import useUserStore from "@/app/store/user";
import ThemeMenu from "./ThemeMenu";

interface IconProps {
    theme: "light" | "dark";
    fontSize: number;
}

const lightGrey = "#fefbfb";
const darkGrey = "#640d14";

export const OsDefault = memo(({ theme, fontSize }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 26.1 26"
            xmlSpace="preserve"
            width="1em"
            height="1em"
            fontSize={fontSize}
        >
            <path
                d="M13.1 1 13 24.9h.1c6.6 0 12-5.4 12-12S19.7 1 13.1 1"
                style={{ fill: theme === "dark" ? lightGrey : darkGrey }}
            />
            <path
                d="M1.2 13c0 6.6 5.3 11.9 11.9 12V1C6.5 1.1 1.2 6.4 1.2 13"
                style={{ fill: theme === "dark" ? darkGrey : lightGrey }}
            />
            <circle
                cx="13.1"
                cy="13"
                r="12"
                style={{
                    fill: "none",
                    stroke: theme === "dark" ? lightGrey : darkGrey,
                    strokeWidth: 2,
                    strokeMiterlimit: 10,
                }}
            />
        </svg>
    );
});

export const DarkIcon = memo(({ theme, fontSize }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            className="iconify iconify--tabler"
            fontSize={fontSize}
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
        >
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z"
            ></path>
        </svg>
    );
});

export const LightIcon = memo(({ theme, fontSize }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            className="iconify iconify--tabler"
            font-size={fontSize}
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M12 19a1 1 0 0 1 .993.883L13 20v1a1 1 0 0 1-1.993.117L11 21v-1a1 1 0 0 1 1-1m6.313-2.09l.094.083l.7.7a1 1 0 0 1-1.32 1.497l-.094-.083l-.7-.7a1 1 0 0 1 1.218-1.567zm-11.306.083a1 1 0 0 1 .083 1.32l-.083.094l-.7.7a1 1 0 0 1-1.497-1.32l.083-.094l.7-.7a1 1 0 0 1 1.414 0M4 11a1 1 0 0 1 .117 1.993L4 13H3a1 1 0 0 1-.117-1.993L3 11zm17 0a1 1 0 0 1 .117 1.993L21 13h-1a1 1 0 0 1-.117-1.993L20 11zM6.213 4.81l.094.083l.7.7a1 1 0 0 1-1.32 1.497l-.094-.083l-.7-.7A1 1 0 0 1 6.11 4.74zm12.894.083a1 1 0 0 1 .083 1.32l-.083.094l-.7.7a1 1 0 0 1-1.497-1.32l.083-.094l.7-.7a1 1 0 0 1 1.414 0M12 2a1 1 0 0 1 .993.883L13 3v1a1 1 0 0 1-1.993.117L11 4V3a1 1 0 0 1 1-1m0 5a5 5 0 1 1-4.995 5.217L7 12l.005-.217A5 5 0 0 1 12 7"
            ></path>
        </svg>
    );
});

const Theme = () => {
    const { theme, toggleThemeMenu } =
        useUserStore();
    const [isDark, setIsDark] = useState(
        window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    const computedTheme = useMemo(() => {
        if (theme === "system") {
            return isDark ? "dark" : "light";
        }
        return theme;
    }, [theme, isDark]);

    const handleThemeClick = useCallback(() => {
        toggleThemeMenu();
    }, []);

    useEffect(() => {
        // if (computedTheme === "dark") {
        //     document.body.classList.add("dark");
        // } else {
        //     document.body.classList.remove("dark");
        // }
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
                // console.log("System theme changed:", e.matches ? "dark" : "light");
                setIsDark(e.matches);
            });
    }, [computedTheme]);

    return (
        <div className="relative">
            <button
                aria-label="Toggle theme menu"
                className="header-btn theme"
                onClick={handleThemeClick}
            >
                {theme === "system" && (
                    <OsDefault theme="light" fontSize={21} />
                )}
                {theme === "dark" && <DarkIcon theme="light" fontSize={21} />}
                {theme === "light" && <LightIcon theme="light" fontSize={21} />}
            </button>
            <ThemeMenu />
        </div>
    );
};

export default memo(Theme);
