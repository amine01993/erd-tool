export interface EdgeFormState {
    values: {
        oldForeignKey: string;
        foreignKey: string;
        reference: string;
        onDelete: string;
        onUpdate: string;
    };
}

export type EdgeFormAction =
    | {
          type: "SET_VALUES";
          values: Partial<EdgeFormState["values"]>;
      }
    | {
          type: "SET_FIELD";
          field: keyof EdgeFormState["values"];
          value: string;
      };
