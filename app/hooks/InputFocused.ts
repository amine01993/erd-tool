import { useEffect, useState } from "react";


const useInputFocused = () => {
    const [inputFocused, setInputFocused] = useState(false);

    useEffect(() => {
        function handleFocusIn(e: FocusEvent) {
            if (
                ["INPUT", "TEXTAREA", "SELECT"].includes(
                    (e.target as HTMLElement).tagName
                )
            ) {
                setInputFocused(true);
            }
        }
        function handleFocusOut(e: FocusEvent) {
            setInputFocused(false);
        }

        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);

        return () => {
            document.removeEventListener("focusin", handleFocusIn);
            document.removeEventListener("focusout", handleFocusOut);
        };
    }, []);

    return inputFocused;
};

export default useInputFocused;

