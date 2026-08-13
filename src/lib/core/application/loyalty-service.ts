import { prisma } from "@/lib/infrastructure/database/prisma";

export class LoyaltyService {
  private POINT_MULTIPLIER = 1; // ₹1 = 1 Point
  
  /**
   * Reward points for a completed order
   */
  async awardPointsForOrder(userId: string, orderId: string, orderTotal: number) {
    const pointsToAward = Math.floor(orderTotal * this.POINT_MULTIPLIER);
    
    if (pointsToAward <= 0) return;

    let account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    
    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: { userId, pointsBalance: 0 }
      });
    }

    await prisma.$transaction([
      prisma.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          type: "EARN_ORDER",
          points: pointsToAward,
          description: "Earned from Order",
          orderId: orderId
        }
      }),
      prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { increment: pointsToAward } }
      })
    ]);
  }

  /**
   * Use points at checkout
   */
  async spendPoints(userId: string, pointsToSpend: number, orderId: string) {
    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account || account.pointsBalance < pointsToSpend) {
      throw new Error("Insufficient points");
    }

    await prisma.$transaction([
      prisma.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          type: "REDEEM_ORDER",
          points: -pointsToSpend,
          description: "Redeemed on Order",
          orderId: orderId
        }
      }),
      prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { decrement: pointsToSpend } }
      })
    ]);
  }

  async getBalance(userId: string) {
    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    return account?.pointsBalance || 0;
  }
}

export const loyalty = new LoyaltyService();
