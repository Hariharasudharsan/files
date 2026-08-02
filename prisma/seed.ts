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

  // 2. Seed Products
  for (const p of productsData) {
    const category = await prisma.category.findUnique({
      where: { slug: p.item_group.toLowerCase().replace(/\s+/g, "-") },
    });

    if (!category) continue;

    await prisma.product.upsert({
      where: { itemCode: p.item_code },
      update: {
        name: p.item_name,
        price: p.standard_rate,
        availableStock: p.stock_qty || 0,
        categoryId: category.id,
        imageUrl: p.image || null,
      },
      create: {
        id: category.id === "633b8ed7-b895-496a-8f75-708add4632a4" ? "7407fb8c-06e5-4cb5-8066-94a923961aed" : undefined,
        itemCode: p.item_code,
        name: p.item_name,
        slug: p.slug,
        description: p.description,
        price: p.standard_rate,
        availableStock: p.stock_qty || 0,
        categoryId: category.id,
        imageUrl: p.image || null,
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
