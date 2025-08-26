import {
    ChangeEvent,
    FormEvent,
    type KeyboardEvent,
    memo,
    type MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import cc from "classcat";
import useDiagramStore, { isReadOnlySelector } from "@/app/store/diagram";
import useAlertStore from "@/app/store/alert";
import { formatLastUpdate } from "@/app/helper/utils";
import { DiagramData } from "@/app/type/DiagramType";
import useUpdateDiagram from "@/app/hooks/DiagramUpdate";
import useAddDiagram from "@/app/hooks/DiagramAdd";

interface DiagramItemProps {
    searchTerm: string;
    diagram: DiagramData;
}

const HighlightedName = memo(
    ({ name, searchTerm }: { name: string; searchTerm: string }) => {
        const startIndex = name.toLowerCase().indexOf(searchTerm.toLowerCase());
        const endIndex = startIndex + searchTerm.length;
        return (
            <>
                {startIndex === -1 && name}
                {startIndex > -1 && (
                    <>
                        {name.slice(0, startIndex)}
                        {endIndex > startIndex && (
                            <span className="bg-[#640d14] text-white">
                                {name.slice(startIndex, endIndex)}
                            </span>
                        )}
                        {name.slice(endIndex)}
                    </>
                )}
            </>
        );
    }
);

const DiagramItem = ({ diagram, searchTerm }: DiagramItemProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedDiagram = useDiagramStore((state) => state.selectedDiagram);
    const selectDiagram = useDiagramStore((state) => state.selectDiagram);
    const updateDiagramName = useDiagramStore(
        (state) => state.updateDiagramName
    );
    const isReadOnly = useDiagramStore(isReadOnlySelector);
    const showToast = useAlertStore((state) => state.showToast);
    const mutation = useUpdateDiagram();
    const mutationAdd = useAddDiagram();

    const [editName, setEditName] = useState(false);
    const [newName, setNewName] = useState(diagram.name);
    const [submitting, setSubmitting] = useState(false);

    const lastUpdate = useMemo(() => {
        const date = new Date(diagram.lastUpdate);
        return formatLastUpdate(date);
    }, [diagram.lastUpdate]);

    const handleEditName = useCallback(
        (
            event:
                | MouseEvent<HTMLParagraphElement>
                | KeyboardEvent<HTMLParagraphElement>
        ) => {
            if (selectedDiagram !== diagram.id || isReadOnly) return;

            const isKeyEvent = (event as KeyboardEvent).key !== undefined;
            if (
                !isKeyEvent ||
                ["Enter", " "].includes((event as KeyboardEvent).key)
            ) {
                setEditName(true);
            }
        },
        [selectedDiagram, isReadOnly]
    );

    const handleNameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setNewName(event.target.value);
        },
        []
    );

    const handleNameBlur = useCallback(() => {
        setEditName(false);
        setNewName(diagram.name);
    }, []);

    const handleNameSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            setSubmitting(true);
            updateDiagramName(mutation, mutationAdd, newName.trim()).then(
                (data) => {
                    console.log("Update diagram name response:", data);
                    if (!data) {
                        setEditName(false);
                        return;
                    }
                    if (data.isValid) {
                        setEditName(false);
                        showToast("Name updated successfully", "success");
                    } else {
                        showToast(data.message, "error");
                    }
                }
            );
            // .finally(() => {
            // });
            setSubmitting(false);
        },
        [newName]
    );

    const handleDiagramSelection = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            const diagramId = event.currentTarget.dataset.id;
            if (!diagramId) return;
            selectDiagram(diagramId);
        },
        [selectDiagram]
    );

    useEffect(() => {
        if (editName && !submitting && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editName, submitting]);

    return (
        <button
            className={cc([
                "diagram-item",
                {
                    selected: selectedDiagram === diagram.id,
                },
            ])}
            data-id={diagram.id}
            onClick={handleDiagramSelection}
        >
            {!editName && (
                <p
                    className="font-semibold diagram-name"
                    role="button"
                    tabIndex={0}
                    aria-label="Press to edit diagram name"
                    onKeyDown={handleEditName}
                    onClick={handleEditName}
                >
                    <HighlightedName
                        name={diagram.name}
                        searchTerm={searchTerm}
                    />
                </p>
            )}
            {editName && (
                <form onSubmit={handleNameSubmit} className="diagram-name-form">
                    <input
                        ref={inputRef}
                        name="diagramName"
                        value={newName}
                        disabled={submitting}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                    />
                </form>
            )}
            <p className="text-sm mt-0.5">{lastUpdate}</p>
        </button>
    );
};

export const DiagramItemPlaceHolder = memo(() => {
    return (
        <div className="diagram-item-placeholder h-12 rounded-md bg-gray-200 my-1 cursor-wait"></div>
    );
});

export default memo(DiagramItem);
