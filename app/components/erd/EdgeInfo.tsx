import { memo, useEffect, useState } from "react";
import useErdStore from "@/app/store/erd";
import useDiagramStore, { isReadOnlySelector } from "@/app/store/diagram";
import { AttributeData } from "../../type/EntityType";
import EdgeForm from "./EdgeForm";
import { checkCompatibility } from "@/app/helper/validation";

export type EdgeInfoData = {
    currentData: {
        foreignKey: string;
        reference: string;
        onDelete: string;
        onUpdate: string;
        edgePosition: string;
    };
    primaryKeys: { column: AttributeData; tableName: string }[];
    foreignKeys: { column: AttributeData; tableName: string }[];
    uniqueTables: Set<string>;
};

const EdgeInfo = () => {
    const selectedEdgeId = useErdStore((state) => state.selectedEdgeId);
    const nodes = useErdStore((state) => state.nodes);
    const edges = useErdStore((state) => state.edges);
    const isReadOnly = useDiagramStore(isReadOnlySelector);
    const [selectedData, setSelectedData] = useState<EdgeInfoData>({
        currentData: {
            foreignKey: "",
            reference: "",
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT",
            edgePosition: "l-r",
        },
        primaryKeys: [],
        foreignKeys: [],
        uniqueTables: new Set(),
    });

    useEffect(() => {
        if (selectedEdgeId && !isReadOnly) {
            let currentData = {
                foreignKey: "",
                reference: "",
                onDelete: "RESTRICT",
                onUpdate: "RESTRICT",
                edgePosition: "l-r",
            };

            const selectedEdge = edges.find(
                (edge) => edge.id === selectedEdgeId
            );

            if (selectedEdge?.data) {
                const {
                    foreignKeyTable,
                    foreignKeyColumn,
                    primaryKeyTable,
                    primaryKeyColumn,
                    onDelete,
                    onUpdate,
                    edgePosition,
                } = selectedEdge.data;
                if (foreignKeyTable) {
                    currentData.foreignKey =
                        foreignKeyTable + "." + foreignKeyColumn;
                }
                if (primaryKeyTable) {
                    currentData.reference =
                        primaryKeyTable + "." + primaryKeyColumn;
                }
                if (onDelete) {
                    currentData.onDelete = onDelete;
                }
                if (onUpdate) {
                    currentData.onUpdate = onUpdate;
                }
                if (edgePosition) {
                    currentData.edgePosition = edgePosition;
                }
            }

            const primaryKeys: { column: AttributeData; tableName: string }[] =
                [];
            const foreignKeys: { column: AttributeData; tableName: string }[] =
                [];
            const uniqueTables = new Set<string>();

            const connectedNodesData = nodes
                .filter(
                    (node) =>
                        node.id === selectedEdge?.source ||
                        node.id === selectedEdge?.target
                )
                .map((n) => n.data);

            for (const nd of connectedNodesData) {
                const attrs = nd.attributes;
                for (const attr of attrs) {
                    if (attr.isPrimaryKey) {
                        primaryKeys.push({
                            column: attr,
                            tableName: nd.name,
                        });
                        uniqueTables.add(nd.name);
                    }
                }
            }
            for (const nd of connectedNodesData) {
                const attrs = nd.attributes;
                for (const attr of attrs) {
                    if (attr.isPrimaryKey) continue;
                    const check = primaryKeys.find((pk) =>
                        checkCompatibility(pk.column, attr)
                    );
                    if (check) {
                        foreignKeys.push({
                            column: attr,
                            tableName: nd.name,
                        });
                        uniqueTables.add(nd.name);
                    }
                }
            }

            setSelectedData({
                currentData,
                primaryKeys,
                foreignKeys,
                uniqueTables,
            });
        }
    }, [selectedEdgeId, isReadOnly, nodes, edges]);

    return (
        <>
            {selectedEdgeId && !isReadOnly && (
                <div className="edge-info">
                    <div className="details">
                        <EdgeForm selectedData={selectedData} />
                    </div>
                </div>
            )}
        </>
    );
};

export default memo(EdgeInfo);
