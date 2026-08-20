import { Logger } from "@/lib/infrastructure/logger";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { success } = await RateLimiter.check(`ratelimit:wishlist_get:${ip}`, 50, 60);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    primaryImage: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ items: wishlist?.items || [] });
  } catch (error) {
    Logger.error("Wishlist GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { success } = await RateLimiter.check(`ratelimit:wishlist_post:${ip}`, 30, 60);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productVariantId } = await req.json();
    if (!productVariantId) {
      return NextResponse.json({ error: "productVariantId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Ensure wishlist exists
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: user.id } });
    }

    // Upsert item
    const wishlistItem = await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productVariantId: {
          wishlistId: wishlist.id,
          productVariantId,
        },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productVariantId,
      },
    });

    return NextResponse.json({ success: true, item: wishlistItem });
  } catch (error) {
    Logger.error("Wishlist POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { success } = await RateLimiter.check(`ratelimit:wishlist_delete:${ip}`, 30, 60);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productVariantId } = await req.json();
    if (!productVariantId) {
      return NextResponse.json({ error: "productVariantId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (!wishlist) return NextResponse.json({ success: true }); // Already empty

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productVariantId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.error("Wishlist DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
