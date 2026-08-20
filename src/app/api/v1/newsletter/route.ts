import { Logger } from "@/lib/infrastructure/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const { success } = await RateLimiter.check(`ratelimit:newsletter:${ip}`, 5, 60);
    if (!success) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Upsert to handle re-subscriptions gracefully
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email }
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter!"
    });
  } catch (error) {
    Logger.error("[POST_NEWSLETTER]", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
