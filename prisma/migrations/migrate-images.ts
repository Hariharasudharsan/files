import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateImages() {
  console.log("Starting Image Data Migration...");

  try {
    // 1. We must execute raw queries if the imageUrl column has already been removed from the Prisma Schema,
    // or if we rely on older schemas. Since we dropped imageUrl from the Prisma schema but it still exists
    // in the DB, we can use raw queries to extract it.
    
    console.log("Fetching existing variants with imageUrl...");
    const variantsWithImages: any[] = await prisma.$queryRaw`
      SELECT id, "imageUrl" FROM "ProductVariant" WHERE "imageUrl" IS NOT NULL;
    `;

    console.log(`Found ${variantsWithImages.length} variants with legacy images.`);

    let migratedCount = 0;

    for (const variant of variantsWithImages) {
      if (!variant.imageUrl) continue;

      // Ensure the Media record exists
      let media = await prisma.media.findFirst({
        where: { url: variant.imageUrl },
      });

      if (!media) {
        media = await prisma.media.create({
          data: {
            id: crypto.randomUUID(),
            url: variant.imageUrl,
            type: "IMAGE",
            alt: "Product Image",
          },
        });
      }

      // Link the Media to the ProductVariant
      await prisma.variantImage.upsert({
        where: {
          productVariantId_mediaId: {
            productVariantId: variant.id,
            mediaId: media.id,
          },
        },
        update: {},
        create: {
          productVariantId: variant.id,
          mediaId: media.id,
        },
      });

      migratedCount++;
    }

    console.log(`Migration Complete. Successfully linked ${migratedCount} images.`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

migrateImages();
