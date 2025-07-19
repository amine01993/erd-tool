import { ChangeEvent, memo, useCallback, useState } from "react";
import { Icon } from "@iconify/react";

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    }, []);

    return (
        <div className="relative mb-2">
            <Icon
                icon="mdi:magnify"
                className="text-[#640D14] absolute right-1 top-1/2 -translate-y-1/2"
                fontSize={18}
            />
            <input
                type="text"
                placeholder="Search..."
                className="border-1 border-[#640D14] rounded-md py-1 px-2 w-full outline-none focus:bg-[#f7dee0] transition-colors duration-200"
                value={searchTerm}
                onChange={handleSearchChange}
            />
        </div>
    );
};

export default memo(SearchBar);
