export function validateEmail(email: string) {
    const errors: string[] = [];
    const regexp = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    if (!email) {
        errors.push("Email cannot be empty");
    } else if (!regexp.test(email)) {
        errors.push("Please enter a correct email");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function validatePassword(password: string, policy: boolean = true) {
    const errors: string[] = [];
    if (!password) {
        errors.push("Password cannot be empty");
    } else if (policy && !/[a-z]/.test(password)) {
        errors.push("Password must contain a lower letter.");
    } else if (policy && !/[A-Z]/.test(password)) {
        errors.push("Password must contain an uppercase letter.");
    } else if (policy && !/[0-9]/.test(password)) {
        errors.push("Password must contain a number.");
    } else if (
        policy &&
        !/[!@#$%^&*(),.?":{}|<>_\-\\[\];'`~+=/]/.test(password)
    ) {
        errors.push("Password must contain a symbol.");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function validatePasswordConfirmation(
    password: string,
    confirmation: string
) {
    const errors: string[] = [];
    if (password !== confirmation) {
        errors.push("Password mismatch");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function validateCode(code: string) {
    if (code.length !== 6) {
        return {
            valid: false,
            errors: ["Confirmation Code required"],
        };
    } else if (!/^[0-9]+$/.test(code)) {
        return {
            valid: false,
            errors: ["Confirmation Code incorrect"],
        };
    } else {
        return {
            valid: true,
            errors: [],
        };
    }
}
