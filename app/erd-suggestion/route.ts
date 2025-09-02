import { streamObject, TelemetrySettings } from "ai";
import "dotenv/config";
import { erdSchema } from "./schema";

export async function POST(req: Request) {
    const prompt = await req.json();

    const result = await streamObject({
        model: "google/gemini-2.0-flash",
        // model: "meta/llama-4-scout",
        // model: "openai/gpt-5-nano",
        system:
            "You are a helpful assistant to a Database Engineer. " +
            "Generate an Entity-Relationship Diagram (ERD) with different entities and relationships. " +
            "Primary keys of type integer are auto incremented.",
        temperature: 0,
        experimental_telemetry: {
            isEnabled: true,
            functionId: "function-erd-suggestions",
        } as TelemetrySettings,
        prompt,
        schema: erdSchema,
    });

    return result.toTextStreamResponse();
}
