import { memo, useEffect } from "react";
import useAlertStore from "@/app/store/alert";
import cc from "classcat";
import Info from "../icons/Info";
import Success from "../icons/Success";
import Error from "../icons/Error";

const Toast = () => {
    const { message, type, isVisible, hideToast } = useAlertStore();

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if(isVisible) {
            timer = setTimeout(() => {
                hideToast();
            }, 3000);
        }

        return () => {
            if(timer) clearTimeout(timer);
        }
    }, [isVisible]);

    return (
        <div
            className={cc([`feedback-toast`, { show: isVisible, hide: !isVisible }])}
        >
            {type === "success" && (
                <Success fontSize={21} />
            )}
            {type === "error" && (
                <Error fontSize={21} />
            )}
            {type === "info" && (
                <Info fontSize={21} />
            )}
            {message}
        </div>
    );
};

export default memo(Toast);
