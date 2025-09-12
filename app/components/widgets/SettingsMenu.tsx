import { memo } from "react";
import cc from "classcat";
import { Icon } from "@iconify/react";
import UserCircleIcon from "@iconify/icons-tabler/user-circle";
import HelpCircleIcon from "@iconify/icons-tabler/help-circle";
import Logout2Icon from "@iconify/icons-tabler/logout-2";
import Login2Icon from "@iconify/icons-tabler/login-2";
import MessageReportIcon from "@iconify/icons-tabler/message-report";
import useUserStore from "@/app/store/user";

const SettingsMenu = () => {
    const isSettingsMenuOpen = useUserStore(
        (state) => state.isSettingsMenuOpen
    );
    const isGuest = useUserStore((state) => state.isGuest);
    const authData = useUserStore((state) => state.authData);
    const closeSettingsMenu = useUserStore((state) => state.closeSettingsMenu);
    const openAuthModal = useUserStore((state) => state.openAuthModal);
    const openFeedbackModal = useUserStore((state) => state.openFeedbackModal);
    const setAuthType = useUserStore((state) => state.setAuthType);
    const logOut = useUserStore((state) => state.logOut);
    const openStepByStepGuide = useUserStore((state) => state.openStepByStepGuide);

    const handleSignUp = () => {
        setAuthType("register");
        closeSettingsMenu();
        openAuthModal();
    };

    const handleSignOut = async () => {
        await logOut();
        closeSettingsMenu();
    };

    const handleFeedback = () => {
        closeSettingsMenu();
        openFeedbackModal();
    };

    const handleShowGuide = () => {
        closeSettingsMenu();
        openStepByStepGuide();
    }

    return (
        <div className={cc(["settings-menu", { open: isSettingsMenuOpen }])}>
            {!isGuest && (
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
                            <button onClick={handleShowGuide}>
                                <Icon icon={HelpCircleIcon} fontSize={21} />
                                Show Guide
                            </button>
                        </li>
                        <li>
                            <button onClick={handleFeedback}>
                                <Icon icon={MessageReportIcon} fontSize={21} />
                                Share Feedback
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
            {isGuest && (
                <ul className="menu-list">
                    <li>
                        <button onClick={handleShowGuide}>
                            <Icon icon={HelpCircleIcon} fontSize={21} />
                            Show Guide
                        </button>
                    </li>
                    <li>
                        <button onClick={handleFeedback}>
                            <Icon icon={MessageReportIcon} fontSize={21} />
                            Share Feedback
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
