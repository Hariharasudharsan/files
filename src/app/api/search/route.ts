import { Logger } from "@/lib/infrastructure/logger";
import { NextResponse } from "next/server";
import { CatalogService } from "@/lib/core/application/CatalogService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const spiceLevel = searchParams.get("spiceLevel");
  const dietType = searchParams.get("dietType");
  const region = searchParams.get("region");
  const mealPairing = searchParams.get("mealPairing");

  try {
    // Use the cached storefront products
    let products = await CatalogService.getStorefrontProducts();

    // Apply filters in memory to avoid redundant Prisma queries
    if (q) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (spiceLevel) products = products.filter(p => p.spiceLevel === spiceLevel);
    if (dietType) products = products.filter(p => p.dietType === dietType);
    if (region) products = products.filter(p => p.region === region);
    if (mealPairing) products = products.filter(p => p.mealPairing === mealPairing);

    // Limit to 8 products and format the response
    // The storefront products from CatalogService already include variants and primaryImage
    const paginatedProducts = products.slice(0, 8);

    return NextResponse.json({ products: paginatedProducts });
  } catch (error: any) {
    Logger.error("[SEARCH_API]", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
