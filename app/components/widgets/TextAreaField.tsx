import { ChangeEvent, memo, useMemo } from "react";
import { nanoid } from "nanoid";

const TextAreaField = ({
    label,
    value,
    onChange,
    placeholder = "",
}: {
    label: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
}) => {
    const id = useMemo(() => {
        return nanoid(5);
    }, []);

    return (
        <div className="text-area-field">
            <label htmlFor={id}>
                {label}
            </label>
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}></textarea>
        </div>
    );
};

export default memo(TextAreaField);
