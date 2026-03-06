import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// FASHN Virtual Try-On v1.5 — ~$0.075 per generation
// Input: model_image (persona) + garment_image (flat-lay/mannequin)
// Output: 576x864 try-on result with preserved pose & lighting

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { model_image, garment_image, category = "auto", mode = "balanced" } = body;

        if (!model_image || !garment_image) {
            return NextResponse.json(
                { error: "model_image and garment_image are required." },
                { status: 400 }
            );
        }

        const result = await fal.subscribe("fal-ai/fashn/tryon/v1.5", {
            input: {
                model_image,
                garment_image,
                category,
                mode,
                garment_photo_type: "auto",
                moderation_level: "permissive",
                num_samples: 1,
                output_format: "jpeg",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("[FASHN Try-On] Processing...");
                }
            },
        });

        return NextResponse.json({
            success: true,
            images: result.data.images,
        });
    } catch (error: unknown) {
        console.error("[FASHN Try-On] Error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
