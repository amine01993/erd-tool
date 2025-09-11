import { memo } from "react";
import { Icon } from "@iconify/react";
import RefreshIcon from "@iconify/icons-tabler/refresh";

const Loading = () => {
    return (
        <div className="flex items-center justify-center bg-(--color-12)/50 z-5 absolute inset-0">
            <div className="flex items-center gap-2 text-(--color-13)">
                <Icon
                    icon={RefreshIcon}
                    fontSize={21}
                    className="animate-spin"
                />
                Loading...
            </div>
        </div>
    );
};

export default memo(Loading);
