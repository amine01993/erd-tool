import { ChangeEvent, memo, useMemo } from "react";
import { nanoid } from "nanoid";
import { Icon } from "@iconify/react";

const SelectField = ({
    label,
    value,
    onChange,
    list,
}: {
    label: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    list: Array<{ value: string | number; label: string }>;
    required?: boolean;
}) => {
    const id = useMemo(() => {
        return nanoid(5);
    }, []);

    return (
        <div className="select-field relative">
            <label htmlFor={id}>{label}</label>
            <select id={id} value={value} onChange={onChange}>
                {list.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <Icon
                icon="tabler:chevron-down"
                width="15"
                height="15"
                className="absolute right-2 top-[calc(50%+12px)] -translate-y-1/2"
            />
        </div>
    );
};

export default memo(SelectField);
