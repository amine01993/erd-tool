import { ChangeEvent, memo } from "react";
import { Icon } from "@iconify/react";
import SearchIcon from "@iconify/icons-tabler/search";

interface SearchBarProps {
    searchTerm: string;
    handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = ({ searchTerm, handleSearchChange }: SearchBarProps) => {
    return (
        <div className="relative mb-2">
            <Icon
                icon={SearchIcon}
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
