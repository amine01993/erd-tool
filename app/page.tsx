"use client";
import dynamic from "next/dynamic";

const Main = dynamic(() => import("./components/erd/Main"), {
    ssr: false,
});

export default function ErdPage() {
    return <Main />;
}
