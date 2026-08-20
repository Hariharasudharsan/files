"use server";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function createShippingZone(data: { name: string; estimatedDays: string; rate: number; isServiceable: boolean }) {
  await prisma.shippingZone.create({
    data
  });
  revalidatePath("/admin/shipping");
}

export async function updateShippingZone(id: string, data: { name: string; estimatedDays: string; rate: number; isServiceable: boolean }) {
  await prisma.shippingZone.update({
    where: { id },
    data
  });
  revalidatePath("/admin/shipping");
  revalidatePath(`/admin/shipping/${id}`);
}

export async function deleteShippingZone(id: string) {
  await prisma.shippingZone.delete({
    where: { id }
  });
  revalidatePath("/admin/shipping");
}

export async function updateZonePincodes(zoneId: string, pincodesString: string) {
  const rawCodes = pincodesString.split(/[,\n]/).map(p => p.trim()).filter(p => p.length === 6 && /^\d+$/.test(p));
  const uniqueCodes = Array.from(new Set(rawCodes));

  // Run in a transaction to ensure atomic replacement
  await prisma.$transaction(async (tx) => {
    // Delete existing pincodes for this zone
    await tx.serviceablePincode.deleteMany({
      where: { zoneId }
    });

    const chunkSize = 2000;
    for (let i = 0; i < uniqueCodes.length; i += chunkSize) {
      const chunk = uniqueCodes.slice(i, i + chunkSize);
      await tx.serviceablePincode.createMany({
        data: chunk.map((p) => ({ pincode: p, zoneId })),
        skipDuplicates: true
      });
    }
  });

  revalidatePath(`/admin/shipping/${zoneId}`);
}
