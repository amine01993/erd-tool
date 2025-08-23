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
import classNames from "classnames";
import { formatLastUpdate } from "@/app/helper/utils";
import { DiagramData } from "@/app/type/DiagramType";
import useDiagramStore from "@/app/store/diagram";
import useAlertStore from "@/app/store/alert";
import useUpdateDiagram from "@/app/hooks/DiagramUpdate";
import useAddDiagram from "@/app/hooks/DiagramAdd";

interface DiagramItemProps {
    diagram: DiagramData;
}

const DiagramItem = ({ diagram }: DiagramItemProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedDiagram = useDiagramStore((state) => state.selectedDiagram);
    const selectDiagram = useDiagramStore((state) => state.selectDiagram);
    const updateDiagramName = useDiagramStore(
        (state) => state.updateDiagramName
    );
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
            if (selectedDiagram !== diagram.id) return;

            const isKeyEvent = (event as KeyboardEvent).key !== undefined;
            if (
                !isKeyEvent ||
                ["Enter", " "].includes((event as KeyboardEvent).key)
            ) {
                setEditName(true);
            }
        },
        [selectedDiagram]
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
            updateDiagramName(mutation, mutationAdd, newName.trim()).then((data) => {
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
            });
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
            className={classNames("diagram-item", {
                selected: selectedDiagram === diagram.id,
            })}
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
                    {diagram.name}
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
