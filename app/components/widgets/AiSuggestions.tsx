import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import RobotIcon from "@iconify/icons-tabler/robot";
import RobotOffIcon from "@iconify/icons-tabler/robot-off";
import useUserStore, { aiSuggestionsEnabledSelector } from "@/app/store/user";
import useDiagramStore from "@/app/store/diagram";
import Tooltip from "../erd/Tooltip";
import useUpdateUserAttribute from "@/app/hooks/UserAttributeUpdate";

const AiSuggestions = () => {
    const aiSuggestionsEnabled = useUserStore(aiSuggestionsEnabledSelector);
    const offLine = useUserStore((state) => state.offLine);
    const category = useDiagramStore((state) => state.category);

    const toggleAiSuggestions = useUserStore(
        (state) => state.toggleAiSuggestions
    );
    const openAiPrompt = useUserStore((state) => state.openAiPrompt);
    const mutationUpdateUserAttribute = useUpdateUserAttribute();

    const handleAiPrompt = useCallback(() => {
        openAiPrompt();
    }, []);

    const handleAiSuggestions = useCallback(() => {
        toggleAiSuggestions(mutationUpdateUserAttribute);
    }, [toggleAiSuggestions]);

    return (
        <>
            {category === "all" && (
                <div className="flex gap-2 items-center">
                    <button
                        className="ai-prompt-btn"
                        disabled={offLine}
                        onClick={handleAiPrompt}
                    >
                        <span className="placeholder">AI Prompt</span>
                        <span className="shortcut">Ctrl+I</span>
                    </button>
                    <button
                        aria-label="Toggle ai suggestions"
                        className="header-btn"
                        id="ai-suggestions-btn"
                        onClick={handleAiSuggestions}
                    >
                        {aiSuggestionsEnabled ? (
                            <Icon icon={RobotIcon} fontSize={21} />
                        ) : (
                            <Icon icon={RobotOffIcon} fontSize={21} />
                        )}
                        <Tooltip
                            message="Toggle AI Suggestions"
                            selector="#ai-suggestions-btn"
                            position="left"
                        />
                    </button>
                </div>
            )}
        </>
    );
};

export default memo(AiSuggestions);
