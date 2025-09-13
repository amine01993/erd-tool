import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import RefreshIcon from "@iconify/icons-tabler/refresh";
import CirclePlusIcon from "@iconify/icons-tabler/circle-plus";
import LayersSubtractIcon from "@iconify/icons-tabler/layers-subtract";
import TrashIcon from "@iconify/icons-tabler/trash";
import TrashOffIcon from "@iconify/icons-tabler/trash-off";
import DatabaseExportIcon from "@iconify/icons-tabler/database-export";
import PromptIcon from "@iconify/icons-tabler/prompt";
import RobotIcon from "@iconify/icons-tabler/robot";
import RobotOffIcon from "@iconify/icons-tabler/robot-off";
import cc from "classcat";
import useUserStore, { aiSuggestionsEnabledSelector } from "@/app/store/user";
import useDiagramStore from "@/app/store/diagram";
import useUpdateUserAttribute from "@/app/hooks/UserAttributeUpdate";
import ThemeMenu from "./ThemeMenu";

interface NavigationMenuProps {
    handleDiagramsRefresh: () => void;
    handleNewDiagram: () => void;
    handleDuplicateDiagram: () => void;
    handleDeleteDiagram: () => void;
    handleRecoverDiagram: () => void;
    handleExportDiagram: () => void;
}

const NavigationMenu = ({
    handleDiagramsRefresh,
    handleNewDiagram,
    handleDuplicateDiagram,
    handleDeleteDiagram,
    handleRecoverDiagram,
    handleExportDiagram,
}: NavigationMenuProps) => {
    const offLine = useUserStore((state) => state.offLine);
    const isNavigationOpen = useUserStore((state) => state.isNavigationOpen);
    const aiSuggestionsEnabled = useUserStore(aiSuggestionsEnabledSelector);
    const refreshing = useDiagramStore((state) => state.refreshing);
    const category = useDiagramStore((state) => state.category);
    const selectedDiagram = useDiagramStore((state) => state.selectedDiagram);
    const loading = useDiagramStore((state) => state.loading);
    const openAiPrompt = useUserStore((state) => state.openAiPrompt);
    const toggleAiSuggestions = useUserStore(
        (state) => state.toggleAiSuggestions
    );
    const mutationUpdateUserAttribute = useUpdateUserAttribute();

    const handleAiPrompt = useCallback(() => {
        openAiPrompt();
    }, []);

    const handleAiSuggestions = useCallback(() => {
        toggleAiSuggestions(mutationUpdateUserAttribute);
    }, [toggleAiSuggestions]);

    return (
        <div className={cc(["navigation-menu", { open: isNavigationOpen }])}>
            <ul>
                <li>
                    <button
                        className="navigation-btn"
                        onClick={handleDiagramsRefresh}
                        disabled={offLine || refreshing}
                    >
                        <Icon icon={RefreshIcon} fontSize={21} />
                        Refresh diagrams&apos; list (Ctrl + R)
                    </button>
                </li>
                {category === "all" && (
                    <>
                        <li>
                            <button
                                className="navigation-btn"
                                onClick={handleNewDiagram}
                            >
                                <Icon icon={CirclePlusIcon} fontSize={21} />
                                Create new diagram (Ctrl + N)
                            </button>
                        </li>
                        <li>
                            <button
                                className="navigation-btn"
                                onClick={handleDuplicateDiagram}
                                disabled={selectedDiagram === "" || loading}
                            >
                                <Icon icon={LayersSubtractIcon} fontSize={21} />
                                Duplicate selected diagram (Ctrl + D)
                            </button>
                        </li>
                    </>
                )}

                <li>
                    <button
                        className="navigation-btn"
                        onClick={handleDeleteDiagram}
                        disabled={selectedDiagram === "" || loading}
                    >
                        <Icon icon={TrashIcon} fontSize={21} />
                        {category === "all"
                            ? "Delete selected diagram (Del)"
                            : "Permanently delete selected diagram (Del)"}
                    </button>
                </li>
                {category === "deleted" && (
                    <li>
                        <button
                            className="navigation-btn"
                            onClick={handleRecoverDiagram}
                            disabled={selectedDiagram === "" || loading}
                        >
                            <Icon icon={TrashOffIcon} fontSize={21} />
                            Recover selected diagram (Ctrl + Shift + R)
                        </button>
                    </li>
                )}
                {category === "all" && (
                    <li>
                        <button
                            className="navigation-btn"
                            onClick={handleExportDiagram}
                            disabled={selectedDiagram === "" || loading}
                        >
                            <Icon icon={DatabaseExportIcon} fontSize={21} />
                            Export (Ctrl + E)
                        </button>
                    </li>
                )}
                {category === "all" && (
                    <>
                        <li>
                            <button
                                className="navigation-btn"
                                disabled={offLine}
                                onClick={handleAiPrompt}
                            >
                                <Icon icon={PromptIcon} fontSize={21} />
                                AI Prompt (Ctrl+I)
                            </button>
                        </li>
                        <li>
                            <button
                                className="navigation-btn"
                                onClick={handleAiSuggestions}
                            >
                                {aiSuggestionsEnabled ? (
                                    <Icon icon={RobotIcon} fontSize={21} />
                                ) : (
                                    <Icon icon={RobotOffIcon} fontSize={21} />
                                )}
                                Toggle ai suggestions
                            </button>
                        </li>
                    </>
                )}
                <li>
                    <ThemeMenu />
                </li>
            </ul>
        </div>
    );
};

export default memo(NavigationMenu);
