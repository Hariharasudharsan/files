import { prisma } from '../database/prisma';
import { Logger } from '../logger';

export async function releaseExpiredReservations() {
  try {
    const expiredReservations = await prisma.inventoryReservation.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: new Date() }
      }
    });

    let releasedCount = 0;

    for (const res of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        // Find ANY inventory level to add the stock back to.
        const level = await tx.inventoryLevel.findFirst({
          where: { productVariantId: res.productVariantId }
        });

        if (level) {
          await tx.inventoryLevel.update({
            where: { id: level.id },
            data: {
              available: { increment: res.qty },
              reserved: { decrement: res.qty }
            }
          });
        }

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'RELEASED' }
        });
        
        releasedCount++;
      });
    }

    Logger.info(`Released ${releasedCount} expired inventory reservations`);
    return releasedCount;
  } catch (error: any) {
    Logger.error('Failed to release reservations', { error: error.message });
    throw error;
  }
}
