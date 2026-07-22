import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Seed Admin User
  const admin = await prisma.customer.upsert({
    where: { email: "admin@mathuramfoods.com" },
    update: {},
    create: {
      email: "admin@mathuramfoods.com",
      name: "System Admin",
      phone: "0000000000",
    },
  });
  console.log("Admin seeded:", admin.email);

  // Seed Products
  const products = [
    { itemCode: "appalam-jeera-01", name: "Jeera Kuchli", standardRate: 150, stockQty: 100, description: "Premium Jeera Kuchli." },
    { itemCode: "vadam-gc-01", name: "Green Chilli Kuchli", standardRate: 160, stockQty: 50, description: "Spicy Green Chilli Kuchli." },
    { itemCode: "appalam-ompodi-01", name: "Ompodi", standardRate: 140, stockQty: 200, description: "Crispy Ompodi." },
  ];

  for (const product of products) {
    const p = await prisma.product.upsert({
      where: { itemCode: product.itemCode },
      update: {},
      create: product,
    });
    console.log("Product seeded:", p.itemCode);
  }

  // Seed CMS Block
  const heroBlock = await prisma.cmsBlock.upsert({
    where: { key: "hero-banner-main" },
    update: {},
    create: {
      key: "hero-banner-main",
      type: "json",
      content: JSON.stringify({
        title: "Taste the Tradition",
        subtitle: "Premium Appalams & Vadams",
        buttonText: "Shop Now",
      }),
    },
  });
  console.log("CMS Block seeded:", heroBlock.key);

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
