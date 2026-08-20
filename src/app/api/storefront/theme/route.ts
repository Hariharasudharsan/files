import { NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

/**
 * Public (no auth) endpoint for storefront components to read theme config.
 * Only exposes the fields needed by customer-facing UI — no admin write.
 */
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "THEME_CONFIG" },
    });

    if (!setting?.value) {
      return NextResponse.json({});
    }

    const config = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;

    // Only expose the subset needed by storefront components
    return NextResponse.json({
      packagingEnabled: config.packagingEnabled ?? true,
      packagingTitle: config.packagingTitle || "Transit-Proof Packaging",
      packagingCopy: config.packagingCopy || "Your order arrives in multi-layered corrugated boxes with air-cushioning for maximum protection.",
      packagingImage: config.packagingImage || "/images/packaging-demo.jpg",
    });
  } catch (error) {
    return NextResponse.json({});
  }
}
