import { memo } from "react";
import cc from "classcat";
import { Icon } from "@iconify/react";
import UserCircleIcon from "@iconify/icons-tabler/user-circle";
import HelpCircleIcon from "@iconify/icons-tabler/help-circle";
import Logout2Icon from "@iconify/icons-tabler/logout-2";
import Login2Icon from "@iconify/icons-tabler/login-2";
import useUserStore from "@/app/store/user";

const SettingsMenu = () => {
    const {
        isSettingsMenuOpen,
        authData,
        closeSettingsMenu,
        openAuthModal,
        setAuthType,
        logOut,
    } = useUserStore();

    const handleSignUp = () => {
        setAuthType("register");
        closeSettingsMenu();
        openAuthModal();
    };

    const handleSignOut = async () => {
        await logOut();
        closeSettingsMenu();
    };

    return (
        <div className={cc(["settings-menu", { open: isSettingsMenuOpen }])}>
            {authData && (
                <>
                    <div className="menu-header">
                        <Icon icon={UserCircleIcon} fontSize={21} />
                        <div className="user-info">
                            <p>{authData.name}</p>
                            <p>{authData.email}</p>
                        </div>
                    </div>
                    <hr />
                    <ul className="menu-list">
                        <li>
                            <button>
                                <Icon icon={HelpCircleIcon} fontSize={21} />
                                Help
                            </button>
                        </li>
                        <li>
                            <button onClick={handleSignOut}>
                                <Icon icon={Logout2Icon} fontSize={21} />
                                Sign Out
                            </button>
                        </li>
                    </ul>
                </>
            )}
            {!authData && (
                <ul className="menu-list">
                    <li>
                        <button>
                            <Icon icon={HelpCircleIcon} fontSize={21} />
                            Help
                        </button>
                    </li>
                    <li>
                        <button onClick={handleSignUp}>
                            <Icon icon={Login2Icon} fontSize={21} />
                            Sign Up
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default memo(SettingsMenu);
