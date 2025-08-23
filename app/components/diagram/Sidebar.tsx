import { ChangeEvent, memo, useCallback, useMemo, useState } from "react";
import useDiagramStore from "../../store/diagram";
import SearchBar from "./SearchBar";
import DiagramItem, { DiagramItemPlaceHolder } from "./DiagramItem";
import { DiagramData } from "@/app/type/DiagramType";

const Sidebar = () => {
    const { diagrams } = useDiagramStore();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDiagrams = useMemo(() => {
        const filtered = diagrams
            .filter((diagram) =>
                diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice();
        filtered.sort((a, b) => b.lastUpdate.localeCompare(a.lastUpdate));
        return filtered;
    }, [diagrams, searchTerm]);

    const handleSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(event.target.value);
        },
        []
    );

    return (
        <>
            <SearchBar
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
            />

            <ul className="flex flex-col gap-1">
                {diagrams.length === 0 && (
                    <>
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                        <DiagramItemPlaceHolder />
                    </>
                )}
                {filteredDiagrams.map((diagram: DiagramData) => (
                    <DiagramItem key={diagram.id} diagram={diagram} />
                ))}
            </ul>
        </>
    );
};

export default memo(Sidebar);
