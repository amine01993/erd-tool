import { nanoid } from "nanoid";
import { ChangeEvent, FocusEvent, memo, useMemo } from "react";

const InputField = ({
    label,
    value,
    type = "text",
    placeholder = "",
    required = false,
    error,
    touched = false,
    max,
    min,
    disabled = false,
    onChange,
    onBlur,
}: {
    label: string;
    value: string | number;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    touched?: boolean;
    max?: number;
    min?: number;
    disabled?: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}) => {
    const id = useMemo(() => {
        return nanoid(5);
    }, []);

    console.log("InputField rendered", {
        touched,error,label
    });

    return (
        <div className="input-field">
            <label htmlFor={id}>
                {label}
                {required && <span className="required">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                max={type === "number" && max !== undefined ? max : undefined}
                min={type === "number" && min !== undefined ? min : undefined}
                disabled={disabled}
            />
            {error && touched && (
                <span className="error">{error}</span>
            )}
        </div>
    );
};

export default memo(InputField);
