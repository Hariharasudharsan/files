import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const key = `ratelimit:coupons:${ip}`;
  
  const { success } = await RateLimiter.check(key, 50, 60);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or inactive coupon" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return NextResponse.json({ error: "Coupon is expired or not yet valid" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toNumber(),
        minOrderValue: coupon.minOrderValue ? coupon.minOrderValue.toNumber() : null,
        maxDiscount: coupon.maxDiscount ? coupon.maxDiscount.toNumber() : null,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
