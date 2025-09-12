import {
    ChangeEvent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
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
import {
    generateInsertsMySql,
    generateMySql,
} from "@/app/helper/mysql-generator";
import {
    generateInsertsSqlServer,
    generateSqlServer,
} from "@/app/helper/sqlserver-generator";
import { generateDataTs, generateTs } from "@/app/helper/typescript-generator";
import useComputedTheme from "@/app/hooks/ComputedTheme";

interface ExportDbProps {
    isDarkMode: boolean;
    option: string;
    language: string;
}

interface GenerateDbProps {
    isDarkMode: boolean;
    option: string;
    language: string;
    generateData: boolean;
    object?: any;
}

interface CodeSnippetActionsProps {
    idPrefix: string;
    isCopied: boolean;
    isCollapsed: boolean;
    handleCopied: () => void;
    handleCollapse: () => void;
}

const CodeSnippetActions = memo(
    ({
        idPrefix,
        isCopied,
        isCollapsed,
        handleCopied,
        handleCollapse,
    }: CodeSnippetActionsProps) => {
        return (
            <div className="export-db-actions absolute top-0.5 right-0.5 flex gap-2">
                <button
                    id={`${idPrefix}-copy-btn`}
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
                                selector={`#${idPrefix}-copy-btn`}
                                position="left"
                            />
                        </>
                    )}
                </button>
                <button
                    id={`${idPrefix}-collapse-btn`}
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
                        selector={`#${idPrefix}-collapse-btn`}
                        position="left"
                    />
                </button>
            </div>
        );
    }
);

const ExportDB = memo(({ isDarkMode, option, language }: ExportDbProps) => {
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

        let _sql = "";
        let nodesData: EntityData[] = [];
        let edgesData: ErdEdgeData[] = [];

        if (diagram && isExportModalOpen) {
            nodesData = diagram.history.states[
                diagram.history.current
            ].nodes.map((node) => node.data as EntityData);
            edgesData = diagram.history.states[
                diagram.history.current
            ].edges.map((edge) => edge.data as ErdEdgeData);

            switch (option) {
                case "mysql":
                    _sql = generateMySql(nodesData, edgesData);
                    break;
                case "sqlserver":
                    _sql = generateSqlServer(nodesData, edgesData);
                    break;
                case "postgresql":
                    _sql = generatePostgreSql(nodesData, edgesData);
                    break;
                case "typescript":
                    _sql = generateTs(nodesData, edgesData);
                    break;
                default:
                    break;
            }
        }

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
                    style={isDarkMode ? oneDark : oneLight}
                    customStyle={{ margin: 0, paddingTop: 20 }}
                    showLineNumbers={true}
                    PreTag="div"
                    wrapLines={true}
                    lineProps={{
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            contentVisibility: "auto",
                        },
                    }}
                >
                    {sql}
                </SyntaxHighlighter>
                <CodeSnippetActions
                    idPrefix="export-db"
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
    ({
        isDarkMode,
        option,
        language,
        generateData,
        object,
    }: GenerateDbProps) => {
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
                switch (option) {
                    case "mysql":
                        _sql = generateInsertsMySql(object);
                        break;
                    case "sqlserver":
                        _sql = generateInsertsSqlServer(object);
                        break;
                    case "postgresql":
                        _sql = generateInsertsPostgreSql(object);
                        break;
                    case "typescript":
                        _sql = generateDataTs(object);
                        break;
                    default:
                        break;
                }
            }

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
                            style={isDarkMode ? oneDark : oneLight}
                            customStyle={{ margin: 0, paddingTop: 20 }}
                            showLineNumbers={true}
                            PreTag="div"
                            wrapLines={true}
                            lineProps={{
                                style: {
                                    display: "flex",
                                    flexWrap: "wrap",
                                    contentVisibility: "auto",
                                },
                            }}
                        >
                            {insertsSql}
                        </SyntaxHighlighter>
                        <CodeSnippetActions
                            idPrefix="generate-db"
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
    const additionalTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const [option, setOption] = useState("postgresql");
    const [generateData, setGenerateData] = useState(false);
    const [additionalRequirements, setAdditionalRequirements] = useState("");
    const offLine = useUserStore((state) => state.offLine);
    const isExportModalOpen = useUserStore((state) => state.isExportModalOpen);
    const closeExportModal = useUserStore((state) => state.closeExportModal);
    const getSelectedDiagram = useDiagramStore(
        (state) => state.getSelectedDiagram
    );
    const computedTheme = useComputedTheme();

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
        if (generateData && additionalTextAreaRef.current) {
            additionalTextAreaRef.current.focus();
        }
    }, [generateData]);

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
                            disabled={offLine}
                        />
                        {generateData && (
                            <>
                                <TextAreaField
                                    ref={additionalTextAreaRef}
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
                                        disabled={isLoading || offLine}
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
                <ExportDB
                    isDarkMode={computedTheme === "dark"}
                    option={option}
                    language={language}
                />
                <GenerateDB
                    isDarkMode={computedTheme === "dark"}
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
