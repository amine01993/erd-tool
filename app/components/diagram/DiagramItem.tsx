import {
    ChangeEvent,
    Dispatch,
    FormEvent,
    type KeyboardEvent,
    memo,
    type MouseEvent,
    SetStateAction,
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
                            <span className="bg-(--color-1) text-(--color-13)">
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

interface DiagramNameFormProps {
    name: string;
    setEditName: Dispatch<SetStateAction<boolean>>;
}

const DiagramNameForm = memo(({ name, setEditName }: DiagramNameFormProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const updateDiagramName = useDiagramStore(
        (state) => state.updateDiagramName
    );
    const showToast = useAlertStore((state) => state.showToast);
    const mutation = useUpdateDiagram();
    const mutationAdd = useAddDiagram();
    const [newName, setNewName] = useState(name);
    const [submitting, setSubmitting] = useState(false);

    const handleNameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setNewName(event.target.value);
        },
        []
    );

    const handleNameBlur = useCallback(() => {
        setEditName(false);
        setNewName(name);
    }, [name]);

    const handleNameSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            setSubmitting(true);
            updateDiagramName(mutation, mutationAdd, newName.trim()).then(
                (data) => {
                    if (!data) {
                        setEditName(false);
                        return;
                    }
                    if (data.isValid) {
                        setEditName(false);
                    } else {
                        showToast(data.message, "error");
                    }
                }
            );
            setSubmitting(false);
        },
        [newName]
    );

    useEffect(() => {
        if (!submitting && inputRef.current) {
            inputRef.current.focus();
        }
    }, [submitting]);

    return (
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
    );
});

const DiagramItem = ({ diagram, searchTerm }: DiagramItemProps) => {
    const selectedDiagram = useDiagramStore((state) => state.selectedDiagram);
    const selectDiagram = useDiagramStore((state) => state.selectDiagram);
    const isReadOnly = useDiagramStore(isReadOnlySelector);
    const [editName, setEditName] = useState(false);
    const [lastUpdateCounter, setLastUpdateCounter] = useState(0);

    const lastUpdate = useMemo(() => {
        const date = new Date(diagram.lastUpdate);
        return formatLastUpdate(date);
    }, [diagram.lastUpdate, lastUpdateCounter]);

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

    const handleDiagramSelection = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            const diagramId = event.currentTarget.dataset.id;
            if (!diagramId) return;
            selectDiagram(diagramId);
        },
        [selectDiagram]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLastUpdateCounter(lastUpdateCounter + 1);
        }, 10000);

        return () => {
            clearTimeout(timeout);
        };
    }, [lastUpdateCounter]);

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
            {editName && !isReadOnly && (
                <DiagramNameForm
                    name={diagram.name}
                    setEditName={setEditName}
                />
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
