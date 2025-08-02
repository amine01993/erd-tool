import { ChangeEvent, memo, useMemo } from "react";
import { nanoid } from "nanoid";

const CheckBoxField = ({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
    const id = useMemo(() => {
        return nanoid(5);
    }, []);

    return (
        <div className="checkbox-field">
            <label htmlFor={id}>{label}</label>
            <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        </div>
    );
};

export default memo(CheckBoxField);
