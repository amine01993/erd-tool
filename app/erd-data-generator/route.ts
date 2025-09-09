import { streamObject, TelemetrySettings } from "ai";
import "dotenv/config";
import { generateZodSchema } from "../helper/schema";
import { EntityData } from "../type/EntityType";
import { ErdEdgeData } from "../type/EdgeType";

export async function POST(req: Request) {
    const prompt = await req.json();
    const { nodesData, edgesData, additionalRequirements } = prompt;

    const schema = generateZodSchema(nodesData);

    const entities = nodesData.map((nd: EntityData) => {
        const attributes = nd.attributes.map((attr) => ({
            name: attr.name,
            type: attr.type,
            isPrimaryKey: attr.isPrimaryKey,
            isAutoIncrement: attr.isAutoIncrement,
            isUnique: attr.isUnique,
            isNullable: attr.isNullable,
            isUnicode: attr.isUnicode,
            defaultValue: attr.defaultValue,
            description: attr.description,
            isCurrent: attr.isCurrent,
            length: attr.length,
            scale: attr.scale,
            precision: attr.precision,
        }));
        return `Entity: ${nd.name}, Attributes: ${JSON.stringify(attributes)}`;
    });

    const relationships = edgesData.map((edge: ErdEdgeData) => {
        if (!edge.primaryKeyColumn || !edge.foreignKeyColumn || !edge.primaryKeyTable || !edge.foreignKeyTable) return "";
        const pkCol = edge.primaryKeyColumn;
        const fkCol = edge.foreignKeyColumn;
        const pkTable = edge.primaryKeyTable;
        const fkTable = edge.foreignKeyTable;
        return `The attribute '${fkCol}' on the entity '${fkTable}' references '${pkTable}(${pkCol})';`;
    });

    const result = await streamObject({
        model: "openai/gpt-4.1-mini",
        system:
            "You are a helpful assistant to a Database Engineer. " +
            "The Entity-Relationship Diagram (ERD) has already been created. " +
            "The user wishes to fill the database with rich and accurate data." +
            "Generate the relevant data based on the user's needs (by following the provided entities and relationships). " +
            "You may also be given in the prompt additional requirements for the data generation. make sure to follow them.",
        temperature: 0,
        experimental_telemetry: {
            isEnabled: true,
            functionId: "function-erd-data-generator",
        } as TelemetrySettings,
        prompt: [
            {
                role: "user",
                content: `Generate data for the following Entities: ${JSON.stringify(entities)}. ` +
                    `and the Relationships: ${JSON.stringify(relationships)}. ` +
                    `The user has the following requirements: ${additionalRequirements || "None"}.`,
            },
        ],
        schema,
        abortSignal: AbortSignal.timeout(50000),
    });

    console.log("Generated ERD data:", result);

    return result.toTextStreamResponse();
}
