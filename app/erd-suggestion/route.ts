import { streamObject, TelemetrySettings } from "ai";
import "dotenv/config";
import { erdSchema } from "./schema";

export async function POST(req: Request) {
    const prompt = await req.json();

    const result = await streamObject({
        model: "openai/gpt-4.1-mini",
        system:
            "You are a helpful assistant to a Database Engineer. " +
            "Generate an Entity-Relationship Diagram (ERD) with different entities and relationships. " +
            "Primary keys of type integer are auto incremented (`isAutoIncrement` is set to true)." +
            "Fill the description property for attributes to define and explain their role if necessary.",
        temperature: 0,
        experimental_telemetry: {
            isEnabled: true,
            functionId: "function-erd-suggestions",
        } as TelemetrySettings,
        prompt,
        schema: erdSchema,
        abortSignal: AbortSignal.timeout(50000),
    });

    return result.toTextStreamResponse();
}
