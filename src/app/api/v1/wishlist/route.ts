import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";

export async function GET(req: NextRequest) {
  try {
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
    console.error("Wishlist GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
    console.error("Wishlist POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
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
    console.error("Wishlist DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
