
export interface EntityFormState {
    value: string;
    error: string | undefined;
    touched: boolean;
    isValid: boolean;
}

export type EntityFormAction =
    | {
          type: "SET_FIELD";
          value: string;
          entityNames?: Set<string>;
      }
    | { type: "SET_TOUCHED" };
