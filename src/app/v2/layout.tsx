import type { Metadata } from "next";
import "./globals-v2.css";

export const metadata: Metadata = {
    title: "AI Models Agency V2 — Virtual Try-On",
    description: "Interface V2 com seleção Tinder-style e visualização Apple Finder",
};

export default function V2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
