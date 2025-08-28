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

    useEffect(() => {
        const elements = document.querySelectorAll(selector);

        const showTooltip = () => setIsVisible(true);
        const hideTooltip = () => setIsVisible(false);

        elements.forEach((element) => {
            element.addEventListener("mouseenter", showTooltip);
            element.addEventListener("mouseleave", hideTooltip);
        });

        return () => {
            elements.forEach((element) => {
                element.removeEventListener("mouseenter", showTooltip);
                element.removeEventListener("mouseleave", hideTooltip);
            });
        };
    }, [selector]);

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
