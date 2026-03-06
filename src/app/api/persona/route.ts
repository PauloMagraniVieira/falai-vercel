import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// FLUX Dev — Persona Image Generator ~$0.025/megapixel
// Generates hyper-realistic AI model images from text prompts
// Uses IP-Adapter FaceID embedding for identity retention

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt, image_size = "portrait_4_3" } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: "prompt is required." },
                { status: 400 }
            );
        }

        const result = await fal.subscribe("fal-ai/flux/dev", {
            input: {
                prompt,
                image_size,
                num_images: 1,
                enable_safety_checker: true,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("[FLUX Dev] Generating persona...");
                }
            },
        });

        return NextResponse.json({
            success: true,
            images: result.data.images,
        });
    } catch (error: unknown) {
        console.error("[FLUX Dev] Error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
