import { memo } from "react";
import { Icon } from "@iconify/react";
import cc from "classcat";
import useUserStore from "@/app/store/user";

const SettingsMenu = () => {
    const { isSettingsMenuOpen } = useUserStore();

    // const handleThemeChange = (e: ChangeEvent<HTMLInputElement>) => {
    //     console.log("handleThemeChange", e.target.value);
    //     setTheme(e.target.value as AppTheme);
    // };

    return (
        <div className={cc(["settings-menu", { open: isSettingsMenuOpen }])}>
            {/* <div className="menu-header">
                <Icon icon="tabler:user-circle" fontSize={21} />
                <div className="user-info">
                    <p>Full Name</p>
                    <p>Email@gmail.com</p>
                </div>
            </div>
            <hr />
            <ul className="menu-list">
                <li>
                    <Icon icon="tabler:help-circle" fontSize={21} />
                    Help
                </li>
                <li>
                    <Icon icon="tabler:logout-2" fontSize={21} />
                    Sign Out
                </li>
            </ul> */}
            <ul className="menu-list">
                <li>
                    <Icon icon="tabler:help-circle" fontSize={21} />
                    Help
                </li>
                <li>
                    <Icon icon="tabler:login-2" fontSize={21} />
                    Sign Up
                </li>
            </ul>
        </div>
    );
};

export default memo(SettingsMenu);
