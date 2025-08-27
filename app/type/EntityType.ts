import { AttributeType } from "@/app/type/AttributeType";

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