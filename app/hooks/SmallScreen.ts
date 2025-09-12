import { useEffect, useState } from "react";

const useSmallScreen = () => {
    const [smallScreenMode, setSmallScreenMode] = useState(false);

    useEffect(() => {
        function handleResize() {
            if (mediaQuery.matches) {
                setSmallScreenMode(false);
            } else {
                setSmallScreenMode(true);
            }
        }

        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        handleResize();

        mediaQuery.addEventListener("change", handleResize);

        return () => {
            mediaQuery.removeEventListener("change", handleResize);
        };
    }, []);

    return smallScreenMode;
};

export default useSmallScreen;
