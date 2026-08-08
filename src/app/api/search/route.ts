import { NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 8,
      include: {
        primaryImage: true,
        variants: {
          take: 1
        }
      }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[SEARCH_API]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
