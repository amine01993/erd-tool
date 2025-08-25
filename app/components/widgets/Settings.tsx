import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import UserCircleIcon from "@iconify/icons-tabler/user-circle";
import SettingsMenu from "./SettingsMenu";
import useUserStore from "@/app/store/user";

const Settings = () => {
    const toggleSettingsMenu = useUserStore(state => state.toggleSettingsMenu);

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
                <Icon icon={UserCircleIcon} fontSize={21} />
            </button>
            <SettingsMenu />
        </div>
    );
};

export default memo(Settings);
