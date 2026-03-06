import { fal } from "@fal-ai/client";

// Configure fal client to use the Next.js proxy route
// This ensures FAL_KEY stays server-side and is never sent to the browser
fal.config({
    proxyUrl: "/api/fal/proxy",
});

export { fal };
