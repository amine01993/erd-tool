import { memo, useCallback, useEffect } from "react";
import { Panel } from "@xyflow/react";
import { Icon } from "@iconify/react";
import ArrowsMaximizeIcon from "@iconify/icons-tabler/arrows-maximize";
import ArrowsMinimizeIcon from "@iconify/icons-tabler/arrows-minimize";
import useUserStore, { isAnyModalOrMenuOpenSelector } from "@/app/store/user";
import Tooltip from "./Tooltip";
import useInputFocused from "@/app/hooks/InputFocused";

const ScreenModePanel = () => {
    const fullscreenMode = useUserStore((state) => state.fullscreenMode);
    const setFullscreenMode = useUserStore((state) => state.setFullscreenMode);
    const isAnyModalOrMenuOpen = useUserStore(isAnyModalOrMenuOpenSelector);
    const isInputFocused = useInputFocused();

    const handleFullscreenMode = useCallback(() => {
        if (isAnyModalOrMenuOpen) return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, [isAnyModalOrMenuOpen]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!isAnyModalOrMenuOpen && !isInputFocused) {
                if (e.key === "F11") {
                    e.preventDefault();
                    handleFullscreenMode();
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isAnyModalOrMenuOpen, isInputFocused]);

    useEffect(() => {
        function onFullScreenChange() {
            if (!document.fullscreenElement) {
                setFullscreenMode(false);
            } else {
                setFullscreenMode(true);
            }
        }
        document.addEventListener("fullscreenchange", onFullScreenChange);
    }, []);
    return (
        <Panel
            position="top-right"
            className="screen-mode-panel bg-(--color-13) shadow-md"
        >
            <button
                title="Fullscreen mode"
                id="fullscreen-button"
                className="text-(--color-12)"
                onClick={handleFullscreenMode}
            >
                {fullscreenMode && (
                    <Icon icon={ArrowsMinimizeIcon} width={24} height={24} />
                )}
                {!fullscreenMode && (
                    <Icon icon={ArrowsMaximizeIcon} width={24} height={24} />
                )}
                <Tooltip
                    message="Fullscreen (F11)"
                    selector="#fullscreen-button"
                    position="left"
                />
            </button>
        </Panel>
    );
};

export default memo(ScreenModePanel);
