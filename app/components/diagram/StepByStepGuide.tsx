import { CSSProperties, memo, useEffect, useMemo, useState } from "react";
import cc from "classcat";
import useUserStore, { guideShownSelector } from "@/app/store/user";
import useComputedTheme from "@/app/hooks/ComputedTheme";
import useSmallScreen from "@/app/hooks/SmallScreen";
import useUpdateUserAttribute from "@/app/hooks/UserAttributeUpdate";

const steps = [
    {
        title: "Welcome to ERD Tool",
        description: (
            <>
                Get started with our easy-to-use Entity-Relationship Diagram
                tool.
            </>
        ),
    },
    {
        title: "Sidebar Overview",
        screenShot: {
            dark: {
                lg: "/step-1-dark-lg.webp",
                sm: "/step-1-dark-sm.webp",
            },
            light: {
                lg: "/step-1-light-lg.webp",
                sm: "/step-1-light-sm.webp",
            },
        },
        description: (
            <>
                <ul>
                    <li>
                        You can browse and select diagrams from the sidebar.
                    </li>
                    <li>Click on the diagram name to edit it.</li>
                </ul>
            </>
        ),
    },
    {
        title: "Header Overview",
        screenShot: {
            dark: {
                lg: "/step-2-dark-lg.webp",
                sm: "/step-2-dark-sm.webp",
            },
            light: {
                lg: "/step-2-light-lg.webp",
                sm: "/step-2-light-sm.webp",
            },
        },
        description: (
            <>
                This section gives you the possibility to manage your diagrams.
                <ul>
                    <li>Undo/Redo changes made to the diagram.</li>
                    <li>Refresh: Reload your diagrams.</li>
                    <li>New Diagram: Create a new diagram.</li>
                    <li>Duplicate: Make a copy of the selected diagram.</li>
                    <li>Delete: Remove the selected diagram.</li>
                    <li>
                        Export: Generate the code for the diagram in SQL or
                        Typescript.
                    </li>
                    <li>
                        The last item shows you whether the diagram is saved or
                        still saving.
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "Header Overview Part 2",
        screenShot: {
            dark: {
                lg: "/step-3-dark-lg.webp",
                sm: "/step-3-dark-sm.webp",
            },
            light: {
                lg: "/step-3-light-lg.webp",
                sm: "/step-3-light-sm.webp",
            },
        },
        description: (
            <>
                <ul>
                    <li>Prompt the AI for a new ERD</li>
                    <li>
                        Enable/Disable AI Assistance (The AI suggestions are
                        shown when <em>selecting</em> entities or relationships,
                        press <strong>Tab</strong> to accept or{" "}
                        <strong>Esc</strong> to dismiss)
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "Right Panel Overview",
        screenShot: {
            dark: {
                lg: "/step-4-dark-lg.webp",
                sm: "/step-4-dark-sm.webp",
            },
            light: {
                lg: "/step-4-light-lg.webp",
                sm: "/step-4-light-sm.webp",
            },
        },
        description: (
            <>
                When selecting an entity or relationship, the right panel shows
                the properties that can be edited.
            </>
        ),
    },
];

const StepByStepGuide = () => {
    const [step, setStep] = useState(1);
    const guideShown = useUserStore(guideShownSelector);
    const setGuideShown = useUserStore((state) => state.setGuideShown);
    const isStepByStepGuideOpen = useUserStore(
        (state) => state.isStepByStepGuideOpen
    );
    const closeStepByStepGuide = useUserStore(
        (state) => state.closeStepByStepGuide
    );
    const openStepByStepGuide = useUserStore(
        (state) => state.openStepByStepGuide
    );
    const computedTheme = useComputedTheme();
    const smallScreenMode = useSmallScreen();
    const mutation = useUpdateUserAttribute();

    const content = useMemo(() => {
        const stepData = steps[step - 1];
        return {
            title: stepData.title,
            description: stepData.description,
            screenShot: stepData.screenShot
                ? stepData.screenShot[computedTheme][
                      smallScreenMode ? "sm" : "lg"
                  ]
                : undefined,
        };
    }, [computedTheme, smallScreenMode, step]);

    const maskPosition = useMemo(() => {
        const pos = { x: "0px", y: "0px", width: "0px", height: "0px" };
        let elem: HTMLElement | null = null;

        if (!smallScreenMode) {
            switch (step) {
                case 2:
                    elem = document.querySelector(".sidebar");
                    break;
                case 3:
                    elem = document.querySelector(".header > div:first-child");
                    break;
                case 4:
                    elem = document.querySelector(".header > div:nth-child(2)");
                    break;
                case 5:
                    elem = document.querySelector(".info-container");
                    break;
                default:
                    break;
            }

            if (elem) {
                const rect = elem.getBoundingClientRect();
                pos.x = `${rect.left}px`;
                pos.y = `${rect.top}px`;
                pos.width = `${rect.width}px`;
                pos.height = `${rect.height}px`;
            }
        }

        return pos;
    }, [smallScreenMode, step]);

    const guidePositionStyle = useMemo(() => {
        const style = {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
        };

        let elem: HTMLElement | null = null;
        const guideElem = document.querySelector(".step-by-step-guide");

        if (!smallScreenMode) {
            switch (step) {
                case 2:
                    elem = document.querySelector(".sidebar");
                    if (elem) {
                        const rect = elem.getBoundingClientRect();
                        style.top = `${rect.top + rect.height / 2}px`;
                        style.left = `${rect.left + rect.width + 12}px`;
                        style.transform = `translate(0, -50%)`;
                    }
                    break;
                case 3:
                    elem = document.querySelector(".header > div:first-child");
                    if (elem) {
                        const rect = elem.getBoundingClientRect();
                        style.top = `${rect.top + rect.height + 12}px`;
                        style.left = `${rect.left}px`;
                        style.transform = `translate(0, 0)`;
                    }
                    break;
                case 4:
                    elem = document.querySelector(".header > div:nth-child(2)");
                    if (elem && guideElem) {
                        const rect = elem.getBoundingClientRect();
                        const guideRect = guideElem.getBoundingClientRect();
                        style.top = `${rect.top + rect.height + 12}px`;
                        style.left = `${
                            rect.left - (guideRect.width - rect.width)
                        }px`;
                        style.transform = `translate(0, 0)`;
                    }
                    break;
                case 5:
                    elem = document.querySelector(".info-container");
                    if (elem && guideElem) {
                        const rect = elem.getBoundingClientRect();
                        const guideRect = guideElem.getBoundingClientRect();
                        style.top = `${rect.top + rect.height / 2}px`;
                        style.left = `${rect.left - (guideRect.width + 12)}px`;
                        style.transform = `translate(0, -50%)`;
                    }
                    break;
                default:
                    break;
            }
        }

        return style;
    }, [smallScreenMode, step]);

    const handleSkip = () => {
        closeStepByStepGuide();
        setStep(1);
        setGuideShown(true, mutation);
    };

    const handlePrevious = () => {
        setStep((s) => Math.max(1, s - 1));
    };

    const handleNext = () => {
        setStep((s) => Math.min(steps.length, s + 1));
    };

    useEffect(() => {
        if (!guideShown) {
            openStepByStepGuide();
        }
    }, [guideShown]);

    return (
        <div
            className={cc([
                "step-by-step-backdrop",
                { open: isStepByStepGuideOpen },
            ])}
            style={
                {
                    "--mask-position-x": `${maskPosition.x}`,
                    "--mask-position-y": `${maskPosition.y}`,
                    "--mask-width": `${maskPosition.width}`,
                    "--mask-height": `${maskPosition.height}`,
                } as CSSProperties
            }
        >
            <div className="step-by-step-guide" style={guidePositionStyle}>
                <h2>{content.title}</h2>
                <div className="description">{content.description}</div>
                {content.screenShot && (
                    <img src={content.screenShot} alt={content.title} />
                )}
                <div className="navigation">
                    <span>
                        {step === 1 && (
                            <button onClick={handleSkip}>Skip</button>
                        )}
                        {step > 1 && (
                            <button onClick={handlePrevious}>Previous</button>
                        )}
                    </span>
                    <span>
                        {step} of {steps.length}
                    </span>
                    <span>
                        {step < steps.length && (
                            <button onClick={handleNext}>Next</button>
                        )}
                        {step === steps.length && (
                            <button onClick={handleSkip}>Finish</button>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default memo(StepByStepGuide);
