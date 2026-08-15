import { prisma } from '../src/lib/infrastructure/database/prisma';

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Review" ADD CONSTRAINT "rating_check" CHECK (rating >= 1 AND rating <= 5);`);
    console.log('Check constraint added successfully.');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('Constraint already exists.');
    } else {
      console.error('Error adding constraint:', error);
    }
  } finally {
    process.exit(0);
  }
}

main();
