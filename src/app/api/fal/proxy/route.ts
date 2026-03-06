import { route } from "@fal-ai/server-proxy/nextjs";

// Official fal.ai proxy route for Next.js App Router
// This keeps FAL_KEY on the server side, never exposed to the client
export const { GET, POST } = route;
