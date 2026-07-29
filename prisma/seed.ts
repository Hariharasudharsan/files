import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import productsData from "../data/products.json";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
        inventory: p.stock_qty,
        categoryId: category.id,
      },
      create: {
        id: crypto.randomUUID(),
        itemCode: p.item_code,
        name: p.item_name,
        slug: p.slug,
        description: `Authentic ${p.item_name} made with traditional recipes.`,
        price: p.standard_rate,
        inventory: p.stock_qty,
        categoryId: category.id,
        imageUrl: p.image || "/images/placeholders/product.webp",
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
