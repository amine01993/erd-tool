import { memo } from "react";
import SearchBar from "./SearchBar";
import useDiagramStore from "../../store/diagram";
import DiagramItem from "./DiagramItem";

const Sidebar = () => {
    const diagrams = useDiagramStore((state) => state.diagrams);

    return (
        <>
            <SearchBar />
            
            <ul className="flex flex-col gap-1">
                {diagrams.map((diagram: any) => (
                    <DiagramItem
                        key={diagram.id}
                        diagram={diagram}
                    />
                ))}
            </ul>
        </>
    );
};

export default memo(Sidebar);
