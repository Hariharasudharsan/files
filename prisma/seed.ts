import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import productsData from "../data/products.json";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
import { prisma } from "@/lib/infrastructure/database/prisma";

async function main() {
  console.log("Seeding Database...");

  // 1. Seed Categories
  const categoryValues = [...new Set(productsData.map((p) => p.item_group))];

  for (const catName of categoryValues) {
    const slug = catName.toLowerCase().replace(/\s+/g, "-");
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: catName,
        slug,
        description: `Premium quality ${catName}`,
      },
    });
  }

  // 2. Seed Products and Variants
  for (const p of productsData) {
    const category = await prisma.category.findUnique({
      where: { slug: p.item_group.toLowerCase().replace(/\s+/g, "-") },
    });

    if (!category) continue;

    // Use slug as the unique identifier for the product
    const productSlug = p.slug || p.item_name.toLowerCase().replace(/\s+/g, "-");

    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: p.item_name,
        categoryId: category.id,
      },
      create: {
        name: p.item_name,
        slug: productSlug,
        description: p.description,
        categoryId: category.id,
      },
    });

    // Create or update the default variant for this product
    await prisma.productVariant.upsert({
      where: { itemCode: p.item_code },
      update: {
        name: "Standard Pack",
        price: p.standard_rate,
        availableStock: p.stock_qty || 0,
        imageUrl: p.image || null,
        productId: product.id,
      },
      create: {
        itemCode: p.item_code,
        name: "Standard Pack",
        price: p.standard_rate,
        availableStock: p.stock_qty || 0,
        imageUrl: p.image || null,
        productId: product.id,
      },
    });
  }

  // 3. Admin Settings & CMS blocks (Phase 4 Foundation)
  await prisma.cmsBlock.upsert({
    where: { key: "homepage-hero" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      key: "homepage-hero",
      type: "json",
      content: JSON.stringify({
        title: "Authentic South Indian Flavors",
        subtitle: "Experience the tradition of handcrafted Appalams and Vadams",
        ctaText: "Shop Now",
        ctaLink: "/products",
      }),
      active: true,
    },
  });

  console.log("Database Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
