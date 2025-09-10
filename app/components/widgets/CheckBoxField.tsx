import { ChangeEvent, memo, useMemo } from "react";
import { nanoid } from "nanoid";

const CheckBoxField = ({
    label,
    checked,
    disabled,
    onChange,
}: {
    label: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
    const id = useMemo(() => {
        return nanoid(5);
    }, []);

    return (
        <div className="checkbox-field">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={onChange}
            />
        </div>
    );
};

export default memo(CheckBoxField);
