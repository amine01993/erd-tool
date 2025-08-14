import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import SettingsMenu from "./SettingsMenu";
import useUserStore from "@/app/store/user";

const Settings = () => {
    const { toggleSettingsMenu } = useUserStore();

    const handleSettingsClick = useCallback(() => {
        toggleSettingsMenu();
    }, []);

    return (
        <div className="relative">
            <button
                aria-label="Toggle User Settings"
                className="header-btn"
                onClick={handleSettingsClick}
            >
                <Icon icon="tabler:user-circle" fontSize={21} />
            </button>
            <SettingsMenu />
        </div>
    );
};

export default memo(Settings);
