import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import UserCircleIcon from "@iconify/icons-tabler/user-circle";
import SettingsMenu from "./SettingsMenu";
import useUserStore from "@/app/store/user";
import Tooltip from "../erd/Tooltip";

const Settings = () => {
    const toggleSettingsMenu = useUserStore(
        (state) => state.toggleSettingsMenu
    );

    const handleSettingsClick = useCallback(() => {
        toggleSettingsMenu();
    }, []);

    return (
        <div className="relative">
            <button
                aria-label="Toggle User Settings"
                className="header-btn"
                id="user-settings-btn"
                onClick={handleSettingsClick}
            >
                <Icon icon={UserCircleIcon} fontSize={21} />
            </button>
            <SettingsMenu />
            <Tooltip
                message="User Settings"
                selector="#user-settings-btn"
                position="left"
            />
        </div>
    );
};

export default memo(Settings);
