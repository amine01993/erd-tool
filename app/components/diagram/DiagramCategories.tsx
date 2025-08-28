import { memo } from "react";
import { Icon } from "@iconify/react";
import FolderOpenIcon from "@iconify/icons-tabler/folder-open";
import TrashIcon from "@iconify/icons-tabler/trash";
import { useQueryClient } from "@tanstack/react-query";
import useDiagramStore from "@/app/store/diagram";
import useUserStore from "@/app/store/user";
import Tooltip from "../erd/Tooltip";

const DiagramCategories = () => {
    const offLine = useUserStore((state) => state.offLine);
    const category = useDiagramStore((state) => state.category);
    const setCategory = useDiagramStore((state) => state.setCategory);
    const emptyDiagrams = useDiagramStore((state) => state.emptyDiagrams);
    const queryClient = useQueryClient();

    const handleDisplayAll = () => {
        if(offLine || category === "all") return;
        setCategory("all");
        emptyDiagrams();
        queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    };

    const handleDisplayDeleted = () => {
        if(offLine || category === "deleted") return;
        setCategory("deleted");
        emptyDiagrams();
        queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    };

    return (
        <ul className="diagram-categories">
            <li id="all-diagrams" className="relative">
                <button
                    aria-label="Display all Diagrams"
                    className={`${category === "all" ? "active" : ""}`}
                    disabled={offLine}
                    onClick={handleDisplayAll}
                >
                    <Icon icon={FolderOpenIcon} width={25} height={25} />
                </button>
                <Tooltip message="All Diagrams" selector="#all-diagrams" position="right" />
            </li>
            <li id="deleted-diagrams" className="relative">
                <button
                    aria-label="Display Recently Deleted Diagrams"
                    className={`${category === "deleted" ? "active" : ""}`}
                    disabled={offLine}
                    onClick={handleDisplayDeleted}
                >
                    <Icon icon={TrashIcon} width={25} height={25} />
                </button>
                <Tooltip message="Recently Deleted Diagrams" selector="#deleted-diagrams" position="right" />
            </li>
        </ul>
    );
};

export default memo(DiagramCategories);
