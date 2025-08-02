"use client";
import { ReactFlowProvider } from "@xyflow/react";
import ERD from "./components/erd/ERD";
import Header from "./components/erd/Header";
import Sidebar from "./components/diagram/Sidebar";
import EntityInfo from "./components/erd/EntityInfo";
import "./components/erd/style.css";


export default function ErdPage() {
    return (
        <div className="h-screen w-full flex flex-col" suppressHydrationWarning={true}>
            <Header />
            <main className="grid grid-cols-[250px_1fr_300px] flex-1 h-[calc(100vh-57px)]">
                <div className="bg-[#fefbfb] text-[#640D14] p-3 border-r border-[#640D14]">
                    <Sidebar />
                </div>

                {/* selected diagram */}
                <div className="">
                    <ReactFlowProvider>
                        <ERD />
                    </ReactFlowProvider>
                </div>

                {/* selected entity panel */}
                <div className="bg-[#fefbfb] text-black p-3 border-l border-gray-400 min-h-full">
                    <EntityInfo />
                </div>

            </main>
        </div>
    );
}
