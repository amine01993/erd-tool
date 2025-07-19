import { memo } from "react";
import SearchBar from "./SearchBar";
import { useSelector } from "react-redux";
import DiagramItem from "./DiagramItem";

const Sidebar = () => {
    const diagrams = useSelector((state: any) => state.diagram.diagrams);

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
