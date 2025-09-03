import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import RobotIcon from "@iconify/icons-tabler/robot";
import RobotOffIcon from "@iconify/icons-tabler/robot-off";
import useUserStore from "@/app/store/user";
import Tooltip from "../erd/Tooltip";

const AiSuggestions = () => {
    const aiSuggestionsEnabled = useUserStore(
        (state) => state.aiSuggestionsEnabled
    );
    const toggleAiSuggestions = useUserStore(
        (state) => state.toggleAiSuggestions
    );
    const openAiPrompt = useUserStore((state) => state.openAiPrompt);

    const handleAiPrompt = useCallback(() => {
        openAiPrompt();
    }, []);

    const handleAiSuggestions = useCallback(() => {
        toggleAiSuggestions();
    }, [toggleAiSuggestions]);

    return (
        <div className="flex gap-2 items-center">
            <button className="ai-prompt-btn" onClick={handleAiPrompt}>
                <span className="placeholder">AI Prompt</span>
                <span className="shortcut">Ctrl+I</span>
            </button>
            <button
                aria-label="Toggle ai suggestions"
                className="header-btn relative"
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
    );
};

export default memo(AiSuggestions);
