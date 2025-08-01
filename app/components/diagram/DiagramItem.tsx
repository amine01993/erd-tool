import { memo, useMemo } from "react";
import classNames from "classnames";
import { DiagramData } from "@/app/store/diagram";
import { formatLastUpdate } from "@/app/helper/utils";

interface DiagramItemProps {
    diagram: DiagramData;
    selected?: boolean;
}

const DiagramItem = ({ diagram, selected }: DiagramItemProps) => {

    const lastUpdate = useMemo(() => {
        const date = new Date(diagram.lastUpdate);
        return formatLastUpdate(date);
    }, [diagram.lastUpdate]);

    return (
        <div
            className={classNames(
                "px-2 py-1 rounded-md text-[#640D14] hover:bg-[#f7dee0] cursor-pointer transition-colors duration-200",
                {
                    "bg-[#f7dee0]": selected
                }
            )}
        >
            <p className="font-semibold">{diagram.name}</p>
            <p className="text-sm mt-0.5">{lastUpdate}</p>
        </div>
    );
};

export default memo(DiagramItem);
