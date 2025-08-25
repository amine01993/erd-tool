import { memo, useEffect } from "react";
import cc from "classcat";
import { Icon } from "@iconify/react";
import CircleCheckFilledIcon from "@iconify/icons-tabler/circle-check-filled";
import CircleXFilledIcon from "@iconify/icons-tabler/circle-x-filled";
import InfoCircleFilledIcon from "@iconify/icons-tabler/info-circle-filled";
import useAlertStore from "@/app/store/alert";

const Toast = () => {
    const message = useAlertStore(state => state.message);
    const type = useAlertStore(state => state.type);
    const isVisible = useAlertStore(state => state.isVisible);
    const hideToast = useAlertStore(state => state.hideToast);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if (isVisible) {
            timer = setTimeout(() => {
                hideToast();
            }, 3000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isVisible]);

    return (
        <div
            className={cc([
                `feedback-toast`,
                { show: isVisible, hide: isVisible === false },
            ])}
        >
            {type === "success" && (
                <Icon icon={CircleCheckFilledIcon} fontSize={21} />
            )}
            {type === "error" && (
                <Icon icon={CircleXFilledIcon} fontSize={21} />
            )}
            {type === "info" && (
                <Icon icon={InfoCircleFilledIcon} fontSize={21} />
            )}
            {message}
        </div>
    );
};

export default memo(Toast);
