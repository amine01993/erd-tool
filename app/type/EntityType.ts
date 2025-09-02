import z from "zod";
import { AttributeType } from "@/app/type/AttributeType";
import { erdSchema } from "../erd-suggestion/schema";

export type EntityData = {
    name: string;
    attributes: AttributeData[];
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
}

export type ErdSchema = z.infer<typeof erdSchema>;
