import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import catalogue from "../data/products-catalogue.json";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
import { prisma } from "@/lib/infrastructure/database/prisma";

type CatalogueImages = Record<string, string>;

type CatalogueProduct = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  legalManufacturer: string;
  description: string;
  ingredients: string | null;
  shelfLife: string | null;
  searchKeywords: string[];
  mrp: number | null;
  sellingPrice: number | null;
  netWeightGrams: number | null;
  grossWeightGrams: number | null;
  dimensionsCm: string | null;
  hsnCode: string | null;
  gstin: string | null;
  fssaiLicense: string | null;
  manufacturerAddress: string | null;
  images: CatalogueImages;
};

const products = catalogue as CatalogueProduct[];

// Category derived from the product's own naming convention (Vadam / Papad / Dumplings).
function categoryFor(name: string): { name: string; slug: string; description: string } {
  const n = name.toLowerCase();
  if (n.includes("vadam")) {
    return { name: "Vadam", slug: "vadam", description: "Traditional sun-dried vadams, fried to a crisp." };
  }
  if (n.includes("dumpling")) {
    return { name: "Dumplings", slug: "dumplings", description: "Lentil-based sun-dried dumplings (vadi)." };
  }
  return { name: "Papad", slug: "papad", description: "Thin, disc-shaped papads in a range of authentic flavours." };
}

// IMPORTANT — READ BEFORE RUNNING IN PRODUCTION:
// gstRate is intentionally left at 0 for every product here, matching the Product model's
// schema default. Plain papad is nil-rated (0%) under GST, but papad-family snacks made by
// extrusion (this catalogue's Ompodi Vadam / Red Chilli Ompodi Vadam products are described
// in their own keyword files as "extrusion" products) have been separately classified as
// "fryums" at 18% under HSN 19059030 in at least one CBIC circular (189/01/2023-GST), as
// distinct from HSN 19059040 "papad" at 0% — this is a real, disputed classification question
// in GST case law, not a fixed fact, and it varies by exact product/shape. Confirm the correct
// rate per product with Mathuram Foods' CA/GST filing before this seed data is used to charge
// real customers. Do not treat the 0 below as a verified rate.
const GST_RATE_PLACEHOLDER = 0;

async function upsertMedia(url: string, alt: string) {
  const existing = await prisma.media.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.media.create({ data: { url, alt, type: "IMAGE" } });
}

async function main() {
  console.log("Seeding real product catalogue...");

  const categorySlugs = new Map<string, string>(); // slug -> id
  for (const p of products) {
    const cat = categoryFor(p.name);
    if (categorySlugs.has(cat.slug)) continue;
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    categorySlugs.set(cat.slug, category.id);
  }

  for (const p of products) {
    const cat = categoryFor(p.name);
    const categoryId = categorySlugs.get(cat.slug)!;

    // 1. Primary (hero) image + gallery media
    const heroUrl = p.images["hero"];
    const primaryMedia = heroUrl ? await upsertMedia(heroUrl, p.name) : null;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        categoryId,
        ingredients: p.ingredients ?? undefined,
        hsnCode: p.hsnCode ?? undefined,
        fssaiLicense: p.fssaiLicense ?? undefined,
        searchKeywords: p.searchKeywords,
        primaryImageId: primaryMedia?.id,
        gstRate: GST_RATE_PLACEHOLDER,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId,
        ingredients: p.ingredients ?? undefined,
        hsnCode: p.hsnCode ?? undefined,
        fssaiLicense: p.fssaiLicense ?? undefined,
        searchKeywords: p.searchKeywords,
        primaryImageId: primaryMedia?.id,
        gstRate: GST_RATE_PLACEHOLDER,
      },
    });

    // 2. Gallery images (everything except hero/card-thumb) as ProductImage rows
    let sortOrder = 0;
    for (const [role, url] of Object.entries(p.images)) {
      if (role === "hero" || role === "card-thumb") continue;
      const media = await upsertMedia(url, `${p.name} - ${role}`);
      await prisma.productImage.upsert({
        where: { productId_mediaId: { productId: product.id, mediaId: media.id } },
        update: { sortOrder },
        create: { productId: product.id, mediaId: media.id, sortOrder },
      });
      sortOrder += 1;
    }

    // 3. Single real-weight variant per product (this catalogue documents one pack size each)
    if (p.sellingPrice != null) {
      await prisma.productVariant.upsert({
        where: { itemCode: p.sku },
        update: {
          name: p.netWeightGrams ? `${p.netWeightGrams}g Pack` : "Standard Pack",
          price: p.sellingPrice,
          compareAtPrice: p.mrp ?? undefined,
          weightGrams: p.netWeightGrams ?? undefined,
          productId: product.id,
          isBestValue: true, // only variant for now — revisit once multi-pack sizes exist
        },
        create: {
          itemCode: p.sku,
          name: p.netWeightGrams ? `${p.netWeightGrams}g Pack` : "Standard Pack",
          price: p.sellingPrice,
          compareAtPrice: p.mrp ?? undefined,
          weightGrams: p.netWeightGrams ?? undefined,
          productId: product.id,
          isBestValue: true,
        },
      });
    }
  }

  // 4. Transparency badges referenced in every product's description/label (gluten-free,
  // preservative-free, natural/vegetarian) — created here so Phase 2's badge system has real
  // data to assign, not empty state. Assignment to specific products is left to the admin UI
  // rather than guessed here, since not every claim applies identically to every SKU.
  const badgeSeeds = [
    { name: "Gluten-Free", icon: "wheat-off" },
    { name: "No Preservatives", icon: "leaf" },
    { name: "100% Vegetarian", icon: "sprout" },
    { name: "FSSAI Verified", icon: "badge-check" },
  ];
  for (const b of badgeSeeds) {
    await prisma.badge.upsert({ where: { name: b.name }, update: {}, create: b });
  }

  console.log(`Seeded ${products.length} real products across ${categorySlugs.size} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
