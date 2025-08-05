import { ChangeEvent, memo, useCallback, useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import useDiagramStore from "../../store/diagram";
import DiagramItem from "./DiagramItem";

const Sidebar = () => {
    const diagrams = useDiagramStore((state) => state.diagrams);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDiagrams = useMemo(() => {
        const filtered = diagrams.filter((diagram) =>
            diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice();
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
                {filteredDiagrams.map((diagram: any) => (
                    <DiagramItem key={diagram.id} diagram={diagram} />
                ))}
            </ul>
        </>
    );
};

export default memo(Sidebar);
