import { memo, MouseEvent, useCallback, useMemo } from "react";
import classNames from "classnames";
import { formatLastUpdate } from "@/app/helper/utils";
import { DiagramData } from "@/app/type/DiagramType";
import useDiagramStore from "@/app/store/diagram";

interface DiagramItemProps {
    diagram: DiagramData;
}

const DiagramItem = ({ diagram }: DiagramItemProps) => {

    const selectedDiagram = useDiagramStore((state) => state.selectedDiagram);
    const selectDiagram = useDiagramStore((state) => state.selectDiagram);

    const lastUpdate = useMemo(() => {
        const date = new Date(diagram.lastUpdate);
        return formatLastUpdate(date);
    }, [diagram.lastUpdate]);

    const handleDiagramSelection = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        const diagramId = event.currentTarget.dataset.id;
        if (!diagramId) return;
        selectDiagram(diagramId);
    }, [selectDiagram]);

    return (
        <button
            className={classNames(
                "px-2 py-1 text-left rounded-md text-[#640D14] hover:bg-[#f7dee0] cursor-pointer transition-colors duration-200",
                {
                    "bg-[#f7dee0]": selectedDiagram === diagram.id
                }
            )}
            data-id={diagram.id}
            onClick={handleDiagramSelection}
        >
            <p className="font-semibold">{diagram.name}</p>
            <p className="text-sm mt-0.5">{lastUpdate}</p>
        </button>
    );
};

export const DiagramItemPlaceHolder = memo(() => {
    return (
        <div className="diagram-item-placeholder h-12 rounded-md bg-gray-200 my-1 cursor-wait">
        </div>
    );
});

export default memo(DiagramItem);
