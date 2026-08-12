import NextAuth from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

const handler = NextAuth(authOptions);

export async function POST(req: NextRequest, context: any) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const key = `ratelimit:auth:${ip}`;
  const limit = parseInt(process.env.RATE_LIMIT_LOGIN_MAX || "5");
  const windowSec = parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_SEC || "900");

  const { success } = await RateLimiter.check(key, limit, windowSec);
  if (!success) {
    return new NextResponse(JSON.stringify({ error: "Too many login attempts. Please try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return handler(req, context);
}

export { handler as GET };
