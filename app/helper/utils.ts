import { DiagramData } from "../type/DiagramType";
import { defaultDiagramValues } from "./variables";

export function formatLastUpdate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

    // Fallback to date string
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Retrieves diagrams from local storage while data is not corrupted.
 * @returns An array of DiagramData objects.
 */
export function getDiagramsFromLocalStorage(): DiagramData[] {
    const diagrams = localStorage.getItem("diagrams");
    let parsedDiagrams = diagrams ? JSON.parse(diagrams) : [];

    parsedDiagrams = parsedDiagrams.map((diagram: DiagramData) => {
        return {
            ...defaultDiagramValues,
            ...diagram,
        };
    });

    return parsedDiagrams;
}