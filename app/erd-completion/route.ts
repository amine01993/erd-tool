import { generateObject, streamObject, TelemetrySettings } from "ai";
import "dotenv/config";
import { erdCompletionSchema } from "./schema";

export async function POST(req: Request) {
    const prompt = await req.json();
    const { nodes, edges, selectedNodes, selectedEdges } = prompt;

    const result = await generateObject({
        model: "openai/gpt-4.1-mini",
        system:
            "You are a helpful assistant to a Database Engineer. " +
            "Given an Entity-Relationship Diagram (ERD) with different entities and relationships as an input. " +
            "Make attributes suggestions to assist the user in creating a perfect database schema. " +
            "If the input is missing whole entities (nodes) or relationships (edges), then provide a list of suggested entities and relationships. " +
            "Focus the suggestions around the selected entities and relationships as given in the prompt." +
            "When suggesting new relationships with non-existing entities, provide suggestions for those entities and their attributes under the `nodes` property." +
            "If a relationship (edge) is suggested, but the foreign key or the referenced attribute is missing in the nodes attributes then add it." +
            "Fill the description property for attributes to define and explain their role if necessary." +
            "When an attribute is a primary key, it does not need to have `isUnique` set to true, " +
            "and it is of type integer it must be auto incremented (`isAutoIncrement` is set to true)." +
            "The length property can only be defined for string attributes." +
            "While scale and precision properties can only be defined for decimal attributes.",
        temperature: 0,
        experimental_telemetry: {
            isEnabled: true,
            functionId: "function-erd-completion",
        } as TelemetrySettings,
        prompt: [
            {
                role: "user",
                content: `current ERD: ${JSON.stringify({
                    nodes,
                    edges,
                })}. ${
                    selectedNodes.length === 0
                        ? "No selected entities"
                        : "selected entities: " + JSON.stringify(selectedNodes)
                }. ${
                    selectedEdges.length === 0
                        ? "No selected relationships"
                        : "selected relationships: " +
                          JSON.stringify(selectedEdges)
                }. Provide suggestions to improve it.`,
            },
        ],
        schema: erdCompletionSchema,
        abortSignal: AbortSignal.timeout(50000),
    });

    console.log("Generated ERD suggestions:", result);

    return result.toJsonResponse();
}
