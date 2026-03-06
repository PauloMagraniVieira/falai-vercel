export interface Persona {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    style: string[];
}

// Pre-defined AI Model Personas
// These images are cached/archived — no need to regenerate = $0.00 per reuse
// In production, these would come from Cloudflare R2 + D1
export const personas: Persona[] = [
    {
        id: "juliana-ai",
        name: "Juliana AI",
        description: "Modelo editorial de alta costura",
        imageUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=576&h=864",
        style: ["editorial", "haute-couture", "elegante"],
    },
    {
        id: "sofia-ai",
        name: "Sofia AI",
        description: "Modelo streetwear urbana",
        imageUrl:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=576&h=864",
        style: ["streetwear", "urbana", "casual"],
    },
    {
        id: "valentina-ai",
        name: "Valentina AI",
        description: "Modelo praia e resort",
        imageUrl:
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=576&h=864",
        style: ["praia", "resort", "tropical"],
    },
    {
        id: "isabella-ai",
        name: "Isabella AI",
        description: "Modelo fitness e athleisure",
        imageUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=576&h=864",
        style: ["fitness", "athleisure", "sporty"],
    },
    {
        id: "camila-ai",
        name: "Camila AI",
        description: "Modelo minimalista contemporânea",
        imageUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=576&h=864",
        style: ["minimalista", "contemporâneo", "clean"],
    },
    {
        id: "luna-ai",
        name: "Luna AI",
        description: "Modelo avant-garde e conceitual",
        imageUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=576&h=864",
        style: ["avant-garde", "conceitual", "artístico"],
    },
];
