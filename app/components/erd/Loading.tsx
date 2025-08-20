import { Icon } from "@iconify/react";
import { memo } from "react";

const Loading = () => {
    return (
        <div className="flex items-center justify-center bg-black/50 z-5 absolute inset-0">
            <div className="flex items-center gap-2 text-white">
                <Icon icon="tabler:refresh" fontSize={21} className="animate-spin" />
                Loading...
            </div>
        </div>
    );
};

export default memo(Loading);