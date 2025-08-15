import { memo } from "react";
import cc from "classcat";
import { Icon } from "@iconify/react";
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
                        <Icon icon="tabler:user-circle" fontSize={21} />
                        <div className="user-info">
                            <p>{authData.name}</p>
                            <p>{authData.email}</p>
                        </div>
                    </div>
                    <hr />
                    <ul className="menu-list">
                        <li>
                            <button>
                                <Icon icon="tabler:help-circle" fontSize={21} />
                                Help
                            </button>
                        </li>
                        <li>
                            <button onClick={handleSignOut}>
                                <Icon icon="tabler:logout-2" fontSize={21} />
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
                            <Icon icon="tabler:help-circle" fontSize={21} />
                            Help
                        </button>
                    </li>
                    <li>
                        <button onClick={handleSignUp}>
                            <Icon icon="tabler:login-2" fontSize={21} />
                            Sign Up
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default memo(SettingsMenu);
