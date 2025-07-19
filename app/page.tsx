"use client";
import StoreProvider from "./StoreProvider";
import ERD from "./components/erd/ERD";
import Header from "./components/erd/Header";
import Sidebar from "./components/erd/Sidebar";
import { DiagramData } from "./store/diagram";

const mockDiagrams: DiagramData[] = [
    {
        id: "1",
        name: "Sample Diagram",
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Another Diagram",
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
    },
    {
        id: "3",
        name: "Third Diagram",
        createAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
    },
];

export default function ErdPage() {
    return (
        <StoreProvider diagrams={mockDiagrams}>
            <div className="min-h-screen w-full flex flex-col">
                <Header />
                <main className="grid grid-cols-[250px_1fr] flex-1">
                    <div className="bg-[#fcf3f3] text-[#640D14] p-3 border-r border-[#640D14]">
                        <Sidebar />
                    </div>

                    {/* selected diagram */}
                    <div className="">
                        <ERD />
                    </div>
                </main>
            </div>
        </StoreProvider>
    );
}
