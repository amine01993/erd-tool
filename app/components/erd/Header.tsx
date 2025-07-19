import Image from "next/image";
import { memo } from "react";
import { Icon } from "@iconify/react";
import "./style.css";
import classNames from "classnames";

const Header = () => {
    return (
        <header
            className={classNames(
                "flex items-center justify-between px-3 py-2 bg-[#fcf3f3] text-[#640D14]",
                "border-b border-[#640D14]",
            )}
        >
            <div className="flex items-center gap-1">
                <Image
                    className="mr-1"
                    src="/logo-light.svg"
                    alt="Entity Relational Diagram Tool logo"
                    width={40}
                    height={35}
                    priority
                />

                <button aria-label="Create new diagram" className="header-btn">
                    <Icon icon="tabler:circle-plus" fontSize={21} />
                </button>

                <button
                    aria-label="Duplicate selected diagram"
                    className="header-btn"
                >
                    <Icon icon="tabler:layers-subtract" fontSize={21} />
                </button>

                <button
                    aria-label="Delete selected diagram"
                    className="header-btn"
                >
                    <Icon icon="tabler:trash" fontSize={21} />
                </button>

                <button className="flex items-center gap-2 header-btn">
                    <Icon icon="tabler:database-export" fontSize={21} />
                    Export
                </button>

                <div className="flex items-center gap-2 p-2">
                    <Icon icon="tabler:cloud" fontSize={21} />
                    {/* <Icon icon="tabler:cloud-check" width="24" height="24" /> */}
                    Saving...
                </div>
            </div>
            <div className="flex items-center">
                {/* theme toggle */}
                <button aria-label="Toggle dark mode" className="">
                    <Icon icon="tabler:moon" fontSize={21} />
                </button>
            </div>
        </header>
    );
};

export default memo(Header);
