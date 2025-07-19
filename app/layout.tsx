import type { Metadata } from "next";
import { Spectral } from "next/font/google";
import "./globals.css";

const spectralSans = Spectral({
    variable: "--font-spectral",
    subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "Entity Relational Diagram Tool",
    description: "This tool will help you draw ERD Diagrams and Design better Apps and Databases.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${spectralSans.className} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
