import { AttributeType } from "./AttributeType";

export interface AttributeFormState {
    values: {
        name: string;
        type: AttributeType;
        isNullable: boolean;
        defaultValue: any;
        isCurrent: boolean;
        isPrimaryKey: boolean;
        isAutoIncrement: boolean;
        isUnique: boolean;
        isForeignKey: boolean;
        foreignKeyTable: string;
        foreignKeyColumn: string;
        length: number;
        precision: number;
        scale: number;
        description: string;
        isUnicode: boolean;
    };
    errors: {
        name?: string;
        defaultValue?: string;
        length?: string;
        precision?: string;
        scale?: string;
    };
    touched: {
        name?: boolean;
        defaultValue?: boolean;
        length?: boolean;
        precision?: boolean;
        scale?: boolean;
    };
    isSubmitting: boolean;
    isValid: boolean;
}

export type AttributeFormAction =
    | {
          type: "SET_VALUES";
          values: Partial<AttributeFormState["values"]>;
      }
    | {
          type: "SET_FIELD";
          field: keyof AttributeFormState["values"];
          value: string | boolean;
          attributeNames?: Set<string>;
      }
    | { type: "SET_TOUCHED"; field: keyof AttributeFormState["touched"] }
    | { type: "SET_SUBMITTING"; isSubmitting: boolean };
