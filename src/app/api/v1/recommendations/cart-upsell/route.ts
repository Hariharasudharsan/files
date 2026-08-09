import { NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET() {
  try {
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
