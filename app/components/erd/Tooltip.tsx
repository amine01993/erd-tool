import { HTMLAttributes, memo, useEffect, useState } from "react";
import cc from "classcat";

interface TooltipProps {
    message: string;
    selector: string;
    position?: "top" | "bottom" | "left" | "right";
    props?: HTMLAttributes<HTMLDivElement>;
}

const Tooltip = ({
    message,
    selector,
    position = "bottom",
    props,
}: TooltipProps) => {
    const { className, ...restProps } = props || {};
    const [isVisible, setIsVisible] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(pointer: coarse)");
        setIsTouchDevice(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setIsTouchDevice(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    useEffect(() => {
        let elements: NodeListOf<HTMLElement> | null = null;
        let element: HTMLElement | null = null;
        let timeout: NodeJS.Timeout | null = null;

        if (selector.startsWith("#")) {
            element = document.getElementById(selector.slice(1));
        } else {
            elements = document.querySelectorAll(selector);
        }

        const showTooltip = () => {
            setIsVisible(true);
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            timeout = setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        };
        const hideTooltip = () => {
            setIsVisible(false);
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        };

        if (isTouchDevice) {
            elements?.forEach((el) => {
                el.addEventListener("touchstart", showTooltip);
            });
            element?.addEventListener("touchstart", showTooltip);
        } else {
            elements?.forEach((el) => {
                el.addEventListener("mouseenter", showTooltip);
                el.addEventListener("mouseleave", hideTooltip);
            });
            element?.addEventListener("mouseenter", showTooltip);
            element?.addEventListener("mouseleave", hideTooltip);
        }

        return () => {
            if (isTouchDevice) {
                elements?.forEach((el) => {
                    el.removeEventListener("touchstart", showTooltip);
                });
                element?.removeEventListener("touchstart", showTooltip);
            } else {
                elements?.forEach((el) => {
                    el.removeEventListener("mouseenter", showTooltip);
                    el.removeEventListener("mouseleave", hideTooltip);
                });
                element?.removeEventListener("mouseenter", showTooltip);
                element?.removeEventListener("mouseleave", hideTooltip);
            }
        };
    }, [selector, isTouchDevice]);

    return (
        <div
            className={cc([
                `tooltip`,
                { hidden: !isVisible },
                position,
                className,
            ])}
            {...restProps}
        >
            {message}
        </div>
    );
};

export default memo(Tooltip);
