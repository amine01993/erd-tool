export type ErdEdgeData = {
    startValue: string;
    endValue: string;
    order: number;
    length: number;
    primaryKeyColumn?: string;
    primaryKeyTable?: string;
    foreignKeyColumn?: string;
    foreignKeyTable?: string;
    onDelete?: string;
    onUpdate?: string;
    edgePosition?: string;
};
