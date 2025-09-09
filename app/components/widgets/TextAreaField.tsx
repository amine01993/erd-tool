import { ChangeEvent, memo, RefObject, useMemo } from "react";
import { nanoid } from "nanoid";

const TextAreaField = ({
    label,
    value,
    placeholder = "",
    error = "",
    touched = false,
    required = false,
    rows = 4,
    ref,
    onChange,
    onBlur,
}: {
    label?: string;
    value: string | number;
    placeholder?: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    rows?: number;
    ref?: RefObject<HTMLTextAreaElement | null>;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
}) => {
    const id = useMemo(() => {
        return nanoid(5);
    }, []);

    return (
        <div className="text-area-field">
            {label && (
                <label htmlFor={id}>
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                rows={rows}
                ref={ref}
            ></textarea>
            {error && touched && <span className="error">{error}</span>}
        </div>
    );
};

export default memo(TextAreaField);
