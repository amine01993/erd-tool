import z from "zod";
import { AttributeType } from "@/app/type/AttributeType";
import { erdSchema } from "../erd-suggestion/schema";
import { erdCompletionSchema } from "../erd-completion/schema";

export type EntityData = {
    name: string;
    attributes: AttributeData[];
    isSuggestion?: boolean;
}

export interface AttributeData {
    id: string;
    name: string;
    type: AttributeType;
    isNullable?: boolean;
    defaultValue?: any;
    isCurrent?: boolean;
    isPrimaryKey?: boolean;
    isAutoIncrement?: boolean;
    isUnique?: boolean;
    isForeignKey?: boolean;
    length?: number;
    precision?: number;
    scale?: number;
    description?: string;
    isUnicode?: boolean;
    isSuggestion?: boolean;
}

export type ErdSchema = z.infer<typeof erdSchema>;
export type ErdCompletionSchema = z.infer<typeof erdCompletionSchema>;
