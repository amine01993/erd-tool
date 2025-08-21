"use client"
import { memo, useCallback, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { NumberSize, Resizable } from "re-resizable";
import { Direction } from "re-resizable/lib/resizer";
import Header from "./Header";
import Sidebar from "../diagram/Sidebar";
import ERD from "./ERD";
import EntityInfo from "./EntityInfo";
import Authentication from "../auth/Authentication";
import Toast from "./Toast";
import "./style.css";


export default memo(function Main() {
    const [entityPanelWidth, setEntityPanelWidth] = useState(300);

    const handleResize = useCallback(
        (
            _: MouseEvent | TouchEvent,
            direction: Direction,
            ref: HTMLElement,
            d: NumberSize
        ) => {
            setEntityPanelWidth(ref.clientWidth);
        },
        []
    );

    return (
        <div
            className="h-screen w-full flex flex-col"
        >
            <Header />
            <main
                className={`grid flex-1 h-[calc(100vh-57px)]`}
                style={{
                    gridTemplateColumns: `250px 1fr ${entityPanelWidth}px`,
                }}
            >
                <div className="bg-[#fefbfb] text-[#640D14] p-3 border-r border-[#640D14] h-[calc(100vh-57px)]">
                    <Sidebar />
                </div>

                <div className="h-[calc(100vh-57px)]">
                    <ReactFlowProvider>
                        <ERD />
                    </ReactFlowProvider>
                </div>

                <Resizable
                    defaultSize={{ width: 298,}}
                    minWidth={200}
                    maxWidth={500}
                    maxHeight={"calc(100vh - 57px)"}
                    enable={{
                        left: true,
                        right: false,
                        top: false,
                        bottom: false,
                    }}
                    grid={[10, 0]}
                    onResize={handleResize}
                    handleClasses={{ left: "resize-handle" }}
                >
                    <div className="bg-[#fefbfb] text-black p-3 pb-0 border-l border-gray-400 h-full">
                        <EntityInfo />
                    </div>
                </Resizable>
            </main>
            <Authentication />
            <Toast />
        </div>
    );
})