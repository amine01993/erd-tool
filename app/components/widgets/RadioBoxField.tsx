import { ChangeEvent, memo, useMemo } from "react";
import { nanoid } from "nanoid";

const RadioBoxField = ({
    label,
    name,
    value,
    model,
    onChange,
}: {
    label: string;
    name: string;
    value: string;
    model: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
    const id = useMemo(() => {
        return nanoid(5);
    }, []);

    return (
        <div className="radio-field">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type="radio"
                name={name}
                value={value}
                checked={model === value}
                onChange={onChange}
            />
        </div>
    );
};

export default memo(RadioBoxField);
