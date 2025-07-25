"use client";
import { ReactFlowProvider } from "@xyflow/react";
import ERD from "./components/erd/ERD";
import Header from "./components/erd/Header";
import Sidebar from "./components/erd/Sidebar";
// import { DiagramData } from "./store/diagram";
import "./components/erd/style.css";


export default function ErdPage() {
    return (
        <div className="min-h-screen w-full flex flex-col" suppressHydrationWarning={true}>
            <Header />
            <main className="grid grid-cols-[250px_1fr] flex-1">
                <div className="bg-[#fcf3f3] text-[#640D14] p-3 border-r border-[#640D14]">
                    <Sidebar />
                </div>

                {/* selected diagram */}
                <div className="">
                    <ReactFlowProvider>
                        <ERD />
                    </ReactFlowProvider>
                </div>
            </main>
        </div>
    );
}
