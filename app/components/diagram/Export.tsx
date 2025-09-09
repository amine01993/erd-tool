import {
    ChangeEvent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Icon } from "@iconify/react";
import XIcon from "@iconify/icons-tabler/x";
import ClipboardCheckIcon from "@iconify/icons-tabler/clipboard-check";
import ClipboardTextIcon from "@iconify/icons-tabler/clipboard-text";
import LayoutNavbarCollapseFilledIcon from "@iconify/icons-tabler/layout-navbar-collapse-filled";
import LayoutBottombarCollapseFilledIcon from "@iconify/icons-tabler/layout-bottombar-collapse-filled";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    oneLight,
    oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import cc from "classcat";
import useUserStore from "@/app/store/user";
import useDiagramStore from "@/app/store/diagram";
import Modal from "../widgets/Modal";
import RadioBoxField from "../widgets/RadioBoxField";
import CheckBoxField from "../widgets/CheckBoxField";
import {
    generateInsertsPostgreSql,
    generatePostgreSql,
} from "@/app/helper/postgre-generator";
import { generateZodSchema } from "@/app/helper/schema";
import TextAreaField from "../widgets/TextAreaField";
import { EntityData } from "@/app/type/EntityType";
import { ErdEdgeData } from "@/app/type/EdgeType";
import Tooltip from "../erd/Tooltip";

interface ExportDbProps {
    option: string;
    language: string;
}

interface GenerateDbProps {
    option: string;
    language: string;
    generateData: boolean;
    object?: any;
}

interface CodeSnippetActionsProps {
    isCopied: boolean;
    isCollapsed: boolean;
    handleCopied: () => void;
    handleCollapse: () => void;
}

const CodeSnippetActions = memo(
    ({
        isCopied,
        isCollapsed,
        handleCopied,
        handleCollapse,
    }: CodeSnippetActionsProps) => {
        return (
            <div className="export-db-actions absolute top-0.5 right-0.5 flex gap-2">
                <button
                    id="export-db-copy-btn"
                    className="relative highlighter-btn"
                    aria-label="Copy to clipboard"
                    onClick={handleCopied}
                >
                    {isCopied && (
                        <Icon
                            icon={ClipboardCheckIcon}
                            width={20}
                            height={20}
                        />
                    )}
                    {!isCopied && (
                        <>
                            <Icon
                                icon={ClipboardTextIcon}
                                width={20}
                                height={20}
                            />
                            <Tooltip
                                message="Copy to clipboard"
                                selector="#export-db-copy-btn"
                                position="left"
                            />
                        </>
                    )}
                </button>
                <button
                    id="export-db-collapse-btn"
                    className="relative highlighter-btn"
                    aria-label={
                        isCollapsed
                            ? "Expand the snippet"
                            : "Collapse the snippet"
                    }
                    onClick={handleCollapse}
                >
                    {isCollapsed && (
                        <Icon
                            icon={LayoutBottombarCollapseFilledIcon}
                            fontSize={21}
                        />
                    )}
                    {!isCollapsed && (
                        <Icon
                            icon={LayoutNavbarCollapseFilledIcon}
                            fontSize={21}
                        />
                    )}
                    <Tooltip
                        message={
                            isCollapsed
                                ? "Expand the snippet"
                                : "Collapse the snippet"
                        }
                        selector="#export-db-collapse-btn"
                        position="left"
                    />
                </button>
            </div>
        );
    }
);

const ExportDB = memo(({ option, language }: ExportDbProps) => {
    const isExportModalOpen = useUserStore((state) => state.isExportModalOpen);
    const getSelectedDiagram = useDiagramStore(
        (state) => state.getSelectedDiagram
    );
    const [isCopied, setIsCopied] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const exportDbClasses = useMemo(() => {
        return cc([
            "export-db relative",
            {
                collapsed: isCollapsed,
            },
        ]);
    }, [isCollapsed]);

    const sql = useMemo(() => {
        const diagram = getSelectedDiagram();

        let nodesData: EntityData[] = [];
        let edgesData: ErdEdgeData[] = [];

        if (diagram && isExportModalOpen) {
            nodesData = diagram.history.states[
                diagram.history.current
            ].nodes.map((node) => node.data as EntityData);
            edgesData = diagram.history.states[
                diagram.history.current
            ].edges.map((edge) => edge.data as ErdEdgeData);
        }

        const _sql = generatePostgreSql(nodesData, edgesData);
        console.log("sql", _sql);
        return _sql;
    }, [isExportModalOpen, option, getSelectedDiagram]);

    const handleCopied = useCallback(() => {
        navigator.clipboard
            .writeText(sql)
            .then(() => {
                setIsCopied(true);
            })
            .catch((err) => {
                console.error("Could not copy text: ", err);
            });
    }, [sql]);

    const handleCollapse = useCallback(() => {
        setIsCollapsed(!isCollapsed);
    }, [isCollapsed]);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => {
                setIsCopied(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    return (
        <>
            <div className={exportDbClasses}>
                <SyntaxHighlighter
                    language={language}
                    style={oneLight}
                    showLineNumbers={true}
                    // wrapLongLines={true}
                    wrapLines={true}
                    lineProps={{
                        style: { flexWrap: "wrap" },
                    }}
                >
                    {sql}
                </SyntaxHighlighter>
                <CodeSnippetActions
                    isCopied={isCopied}
                    isCollapsed={isCollapsed}
                    handleCopied={handleCopied}
                    handleCollapse={handleCollapse}
                />
            </div>
        </>
    );
});

const GenerateDB = memo(
    ({ option, language, generateData, object }: GenerateDbProps) => {
        const isExportModalOpen = useUserStore(
            (state) => state.isExportModalOpen
        );
        const getSelectedDiagram = useDiagramStore(
            (state) => state.getSelectedDiagram
        );

        const [isCopied, setIsCopied] = useState(false);
        const [isCollapsed, setIsCollapsed] = useState(false);

        const generateDbClasses = useMemo(() => {
            return cc([
                "generate-db relative",
                {
                    collapsed: isCollapsed,
                },
            ]);
        }, [isCollapsed]);

        const insertsSql = useMemo(() => {
            const diagram = getSelectedDiagram();

            let _sql = "";

            if (generateData && diagram && isExportModalOpen && object) {
                _sql = generateInsertsPostgreSql(object);
            }

            console.log("insertsSql", _sql);
            return _sql;
        }, [
            isExportModalOpen,
            generateData,
            option,
            object,
            getSelectedDiagram,
        ]);

        const handleCopied = useCallback(() => {
            navigator.clipboard
                .writeText(insertsSql)
                .then(() => {
                    setIsCopied(true);
                })
                .catch((err) => {
                    console.error("Could not copy text: ", err);
                });
        }, [insertsSql]);

        const handleCollapse = useCallback(() => {
            setIsCollapsed(!isCollapsed);
        }, [isCollapsed]);

        useEffect(() => {
            if (isCopied) {
                const timer = setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
                return () => clearTimeout(timer);
            }
        }, [isCopied]);

        return (
            <>
                {generateData && (
                    <div className={generateDbClasses}>
                        <SyntaxHighlighter
                            language={language}
                            style={oneLight}
                            showLineNumbers={true}
                            // wrapLongLines={true}
                            wrapLines={true}
                            lineProps={{
                                style: { flexWrap: "wrap" },
                            }}
                        >
                            {insertsSql}
                        </SyntaxHighlighter>
                        <CodeSnippetActions
                            isCopied={isCopied}
                            isCollapsed={isCollapsed}
                            handleCopied={handleCopied}
                            handleCollapse={handleCollapse}
                        />
                    </div>
                )}
            </>
        );
    }
);

const Export = () => {
    const [option, setOption] = useState("postgresql");
    const [generateData, setGenerateData] = useState(false);
    const [additionalRequirements, setAdditionalRequirements] = useState("");
    const isExportModalOpen = useUserStore((state) => state.isExportModalOpen);
    const closeExportModal = useUserStore((state) => state.closeExportModal);
    const getSelectedDiagram = useDiagramStore(
        (state) => state.getSelectedDiagram
    );

    // options: postgresql, mysql, sqlserver, typescript
    const language = useMemo(() => {
        switch (option) {
            case "postgresql":
            case "mysql":
            case "sqlserver":
                return "sql";
            case "typescript":
                return "typescript";
            default:
                return "sql";
        }
    }, [option]);

    const dataSchema = useMemo(() => {
        const diagram = getSelectedDiagram();

        let nodesData: EntityData[] = [];

        if (diagram && isExportModalOpen) {
            nodesData = diagram.history.states[
                diagram.history.current
            ].nodes.map((node) => node.data as EntityData);
        }

        return generateZodSchema(nodesData);
    }, [getSelectedDiagram, isExportModalOpen]);

    const { isLoading, object, submit, stop } = useObject({
        api: "/erd-data-generator",
        schema: dataSchema,
        onFinish({ object, error }) {
            console.log("Schema validation error:", error);
        },
        onError(error) {
            // error during fetch request:
            console.error("An error occurred:", error);
        },
    });

    const handleClose = useCallback(() => {
        closeExportModal();
    }, []);

    const handleOptionChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setOption(event.target.value);
        },
        []
    );
    const handleGenerateDataChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setGenerateData(event.target.checked);
        },
        []
    );
    const handleAdditionalRequirementsChange = useCallback(
        (event: ChangeEvent<HTMLTextAreaElement>) => {
            setAdditionalRequirements(event.target.value);
        },
        []
    );

    const handleStop = useCallback(() => {
        if (isLoading) {
            stop();
        }
    }, [isLoading]);

    const handleGenerateData = useCallback(() => {
        if (!isLoading) {
            const diagram = getSelectedDiagram();

            let nodesData: EntityData[] = [];
            let edgesData: ErdEdgeData[] = [];

            if (diagram) {
                nodesData = diagram.history.states[
                    diagram.history.current
                ].nodes.map((node) => node.data as EntityData);
                edgesData = diagram.history.states[
                    diagram.history.current
                ].edges.map((edge) => edge.data as ErdEdgeData);
            }

            submit({ nodesData, edgesData, additionalRequirements });
        }
    }, [isLoading, additionalRequirements, submit, getSelectedDiagram]);

    useEffect(() => {
        console.log("generateData", { isLoading, object });
    }, [isLoading, object]);

    return (
        <Modal
            isOpen={isExportModalOpen}
            handleClose={handleClose}
            className="export-diagram"
        >
            <div className="flex flex-col gap-4 p-4 export-options">
                <h1 className="text-xl font-semibold">
                    Export Diagram Options:
                </h1>

                <div className="grid grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <RadioBoxField
                            label="To PostgresSQL"
                            name="exportOption"
                            value="postgresql"
                            model={option}
                            onChange={handleOptionChange}
                        />
                        <RadioBoxField
                            label="To MySQL"
                            name="exportOption"
                            value="mysql"
                            model={option}
                            onChange={handleOptionChange}
                        />
                        <RadioBoxField
                            label="To SQLServer"
                            name="exportOption"
                            value="sqlserver"
                            model={option}
                            onChange={handleOptionChange}
                        />
                        <RadioBoxField
                            label="To TypeScript"
                            name="exportOption"
                            value="typescript"
                            model={option}
                            onChange={handleOptionChange}
                        />
                    </div>
                    <div className="flex flex-col gap-4 border-l-3 pl-4">
                        <CheckBoxField
                            label="Generate Data"
                            checked={generateData}
                            onChange={handleGenerateDataChange}
                        />
                        {generateData && (
                            <>
                                <TextAreaField
                                    placeholder="Any additional requirements or specifications for the data generation?"
                                    value={additionalRequirements}
                                    onChange={
                                        handleAdditionalRequirementsChange
                                    }
                                    rows={3}
                                />
                                <div className="action-btns justify-between! mt-0!">
                                    <button
                                        className={cc([
                                            "cancel-btn",
                                            { invisible: !isLoading },
                                        ])}
                                        onClick={handleStop}
                                    >
                                        Stop
                                    </button>
                                    <button
                                        className="confirm-btn"
                                        disabled={isLoading}
                                        onClick={handleGenerateData}
                                    >
                                        {isLoading
                                            ? "Generating..."
                                            : "Generate"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <ExportDB option={option} language={language} />
                <GenerateDB
                    option={option}
                    language={language}
                    generateData={generateData}
                    object={object}
                />
            </div>
            <button className="close-modal" onClick={handleClose}>
                <Icon icon={XIcon} width={20} height={20} />
            </button>
        </Modal>
    );
};

export default memo(Export);
