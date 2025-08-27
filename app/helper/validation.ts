import { attributeTypes } from "../type/AttributeType";
import { AttributeData } from "../type/EntityType";

// prettier-ignore
const reserved = new Set([
    "select", "from", "where", "table", "insert", "delete", "update", "join", "create",
    "drop", "alter", "index", "and", "or", "not", "null", "in", "as", "on",
    "by", "into", "set", "values", "group", "order", "limit", "offset", "all", "analyse",
    "analyze", "any", "array", "asc", "asymmetric", "authorization", "binary", "both", "case", "cast",
    "check", "collate", "collation", "column", "concurrently", "constraint", "cross", "current_catalog", "current_date", "current_role",
    "current_schema", "current_time", "current_timestamp", "current_user", "default", "deferrable", "desc", "distinct", "do", "else",
    "end", "except", "false", "fetch", "for", "foreign", "freeze", "full", "grant", "having",
    "ilike", "initially", "inner", "intersect", "is", "isnull", "lateral", "leading", "left", "like",
    "localtime", "localtimestamp", "natural", "notnull", "only", "outer", "overlaps", "placing", "primary", "references",
    "returning", "right", "session_user", "similar", "some", "symmetric", "tablesample", "then", "to", "trailing",
    "true","union", "unique", "user", "using", "variadic", "verbose", "when", "window", "with"
]);

export function validateName(name: string, uniqueNames?: Set<string>) {
    const errors: string[] = [];
    if (!name) {
        errors.push("Name cannot be empty");
    } else if (uniqueNames && uniqueNames.has(name)) {
        errors.push("This name already exists");
    } else if (name.length > 63) {
        errors.push("Name must not exceed 63 characters.");
    } else if (!/^[a-zA-Z]/.test(name)) {
        errors.push("Name must start with a letter or underscore.");
    } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        errors.push("Only letters, numbers, and underscores are allowed.");
    } else if (reserved.has(name)) {
        errors.push("Name must not be a reserved SQL keyword.");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

function checkIfValidNumber(nbr: string) {
    return /^\d+$/.test(nbr);
}

export function validateLength(length: string) {
    const errors: string[] = [];
    if (!checkIfValidNumber(length)) {
        errors.push("Length must a valid number");
    } else if (Number(length) < 1) {
        errors.push("Length must be strictly positive");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function validatePrecision(precision: string) {
    const errors: string[] = [];
    if (!checkIfValidNumber(precision)) {
        errors.push("Precision must a valid number");
    } else if (Number(precision) < 1 || Number(precision) > 38) {
        errors.push("Precision must be between 1 and 38");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function validateScale(scale: string, precision: string) {
    const errors: string[] = [];
    if (!checkIfValidNumber(scale)) {
        errors.push("Scale must a valid number");
    } else if (
        checkIfValidNumber(precision) &&
        (Number(scale) < 1 || Number(scale) > 38)
    ) {
        errors.push("Scale must be between 1 and " + precision);
    } else if (Number(scale) < 1 || Number(scale) > 30) {
        errors.push("Scale must be between 1 and 30");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function validateDefault(value: any, type: keyof typeof attributeTypes) {
    const errors: string[] = [];

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function checkCompatibility(pk: AttributeData, fk: AttributeData) {
    // Check if the source and target columns are compatible
    if (pk.type === "text" && fk.type === "text") return true;
    if (pk.type === "string" && fk.type === "string") {
        const pkLen = pk.length || 255;
        const fkLen = fk.length || 255;
        if (pkLen <= fkLen) return true;
    }

    if (pk.type === "largeint" && fk.type === "largeint") return true;
    if (pk.type === "integer" && fk.type === "integer") return true;
    if (pk.type === "smallint" && fk.type === "smallint") return true;

    if (pk.type === "double" && fk.type === "double") return true;
    if (pk.type === "float" && fk.type === "float") return true;


    if (pk.type === "numeric" && fk.type === "numeric") {
        const pkPrecision = pk.precision || 38;
        const fkPrecision = fk.precision || 38;
        const pkScale = pk.scale || 0;
        const fkScale = fk.scale || 0;

        if (pkPrecision === fkPrecision && pkScale === fkScale) return true;
    }

    return false;
}
