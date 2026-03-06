import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting middleware — in-memory counter
// In production, use Cloudflare D1 or KV for distributed state
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

export function middleware(request: NextRequest) {
    // Only rate-limit API routes
    if (!request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Skip the fal proxy route (it has its own limits)
    if (request.nextUrl.pathname.startsWith("/api/fal/")) {
        return NextResponse.next();
    }

    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const entry = rateLimit.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return NextResponse.next();
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    entry.count++;
    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
