import { memo, useCallback, useRef } from "react";
import useUserStore from "@/app/store/user";
import Tooltip from "../erd/Tooltip";

const NavigationBtn = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const isNavigationOpen = useUserStore((state) => state.isNavigationOpen);
    const openNavigation = useUserStore((state) => state.openNavigation);
    const closeNavigation = useUserStore((state) => state.closeNavigation);

    const handleNavigationClick = useCallback(() => {
        if (isNavigationOpen) {
            closeNavigation();
        } else {
            openNavigation();
            if (svgRef.current) {
                svgRef.current.style.setProperty("--path-1-translate", "2.5px");
                svgRef.current.style.setProperty("--path-1-rotate", "45deg");
                svgRef.current.style.setProperty("--path-2-translate", "2.5px");
                svgRef.current.style.setProperty("--path-2-rotate", "-45deg");
            }
        }
    }, [isNavigationOpen, closeNavigation, openNavigation]);

    return (
        <div className="relative">
            <button
                aria-label="Toggle navigation menu"
                className="header-btn"
                id="navigation-btn"
                onClick={handleNavigationClick}
            >
                <svg
                    ref={svgRef}
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    className={isNavigationOpen ? "x" : ""}
                >
                    <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16"
                    >
                    </path>
                    <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 12h16"
                    >
                    </path>
                    <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 18h16"
                    ></path>
                </svg>
            </button>
            <Tooltip
                message="Navigation Menu"
                selector="#navigation-btn"
                position="left"
            />
        </div>
    );
};

export default memo(NavigationBtn);
