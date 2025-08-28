import {
    ChangeEvent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import useDiagramStore from "../../store/diagram";
import SearchBar from "./SearchBar";
import DiagramItem, { DiagramItemPlaceHolder } from "./DiagramItem";
import { DiagramData } from "@/app/type/DiagramType";
import cc from "classcat";

const Sidebar = () => {
    const listRef = useRef<HTMLUListElement>(null);
    const category = useDiagramStore((state) => state.category);
    const diagrams = useDiagramStore((state) => state.diagrams);
    const loadingDiagrams = useDiagramStore((state) => state.loadingDiagrams);
    const [searchTerm, setSearchTerm] = useState("");
    const [hasScrollbar, setHasScrollbar] = useState(false);

    const filteredDiagrams = useMemo(() => {
        const filtered = diagrams
            .filter((diagram) =>
                diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice();
        if (category === "all") {
            filtered.sort((a, b) => b.lastUpdate.localeCompare(a.lastUpdate));
        } else {
            filtered.sort((a, b) => {
                if (!a.deletedAt || !b.deletedAt) {
                    return b.lastUpdate.localeCompare(a.lastUpdate);
                }
                return b.deletedAt.localeCompare(a.deletedAt);
            });
        }
        return filtered;
    }, [diagrams, searchTerm, category]);

    const handleSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(event.target.value);
        },
        []
    );

    useEffect(() => {
        function hasScrollbar() {
            if (!listRef.current) return false;
            return listRef.current.scrollHeight > listRef.current.clientHeight;
        }

        setHasScrollbar(hasScrollbar());
    }, [filteredDiagrams.length]);

    return (
        <>
            <SearchBar
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
            />

            {category === "deleted" && diagrams.length > 0 && (
                <div className="text-sm opacity-90 mb-2">
                    Diagrams are available here for 30 days. After that time, they will be permanently deleted.
                </div>
            )}
            <ul
                className={cc([
                    "diagram-list",
                    { "has-scrollbar": hasScrollbar },
                ])}
                ref={listRef}
            >
                {loadingDiagrams && filteredDiagrams.length === 0 && (
                    <>
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                    </>
                )}
                {filteredDiagrams.map((diagram: DiagramData) => (
                    <DiagramItem
                        key={diagram.id}
                        searchTerm={searchTerm}
                        diagram={diagram}
                    />
                ))}
            </ul>
        </>
    );
};

export default memo(Sidebar);
