import {
    ChangeEvent,
    ClipboardEvent,
    FocusEvent,
    KeyboardEvent,
    RefObject,
    SetStateAction,
    useCallback,
    useRef,
} from "react";
import { validateCode } from "@/app/helper/auth-validation";

interface ConfirmationInputType {
    length: number;
    label?: string;
    id: string;
    required: boolean;
    submitted: boolean;
    error: string;
    codeRef: RefObject<string>;
    setError: (value: SetStateAction<string>) => void;
}

export default function ConfirmationInput({
    length,
    label,
    id,
    required,
    submitted,
    error,
    codeRef,
    setError,
}: ConfirmationInputType) {
    const inputRefs = useRef<HTMLInputElement[]>(Array(length).fill(null));

    const updateCode = useCallback(() => {
        codeRef.current = "";
        for (const iref of inputRefs.current) {
            if (iref) {
                codeRef.current += iref.value;
            }
        }

        if (submitted) {
            const validation = validateCode(codeRef.current);
            if(validation.valid) {
                setError("");
            } else {
                setError(validation.errors[0]);
            }
        }
    }, [submitted, setError]);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const nextInput = input.nextElementSibling as HTMLInputElement;
        if (nextInput && input.value) {
            (nextInput as HTMLElement).focus();
            if (nextInput.value) {
                nextInput.select();
            }
        }
        updateCode();
    }, [updateCode]);

    const handlePaste = useCallback((event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const paste = event.clipboardData.getData("text");

        let input = event.target as HTMLInputElement,
            i = 0;
        while (paste[i] && input) {
            input.value = paste[i] || "";
            i++;
            input = input.nextElementSibling as HTMLInputElement;
        }
        updateCode();
    }, [updateCode]);

    const handleBackspace = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        if (input.value) {
            input.value = "";
            updateCode();
        } else if (input.previousElementSibling) {
            (input.previousElementSibling as HTMLElement).focus();
        }
    }, [updateCode]);

    const handleArrowLeft = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        const previousInput = (event.target as HTMLInputElement)
            .previousElementSibling;
        if (previousInput) {
            (previousInput as HTMLElement).focus();
        }
    }, []);

    const handleArrowRight = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        const nextInput = (event.target as HTMLInputElement).nextElementSibling;
        if (nextInput) {
            (nextInput as HTMLElement).focus();
        }
    }, []);

    const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
        event.target.select();
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "Backspace":
                handleBackspace(event);
                break;
            case "ArrowLeft":
                handleArrowLeft(event);
                break;
            case "ArrowRight":
                handleArrowRight(event);
                break;
        }
    }, [handleBackspace, handleArrowLeft, handleArrowRight]);

    return (
        <div className="confirmation-input-container">
            {label && (
                <label htmlFor={id}>
                    {label} {required && <span className="required">*</span>}
                </label>
            )}
            <div className="confirmation-input">
                {Array(length)
                    .fill(0)
                    .map((nbr, index) => {
                        return (
                            <input
                                key={`confirmation-input-${index}`}
                                id={index === 0 ? id : undefined}
                                maxLength={1}
                                onFocus={handleFocus}
                                onKeyDown={handleKeyDown}
                                onChange={handleChange}
                                onPaste={handlePaste}
                                ref={(ref) => {
                                    inputRefs.current[index] = ref!;
                                }}
                                aria-required={required}
                            />
                        );
                    })}
            </div>
            {submitted && error && <div className="error-message">{error}</div>}
        </div>
    );
}
