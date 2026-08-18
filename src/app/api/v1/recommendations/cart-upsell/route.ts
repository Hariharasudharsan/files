import { NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { success } = await RateLimiter.check(`ratelimit:upsell:${ip}`, 100, 60);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Fetch a few products under a certain price or just featured
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        variants: true,
        primaryImage: true,
      },
      take: 3,
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch upsells" }, { status: 500 });
  }
}
