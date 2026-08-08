"use server";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { orderSyncWorker } from "@/lib/infrastructure/workers/OrderSyncWorker"; // Or rather enqueueing logic

export async function replaySync(formData: FormData) {
  const logId = formData.get("logId") as string;
  if (!logId) return;

  const log = await prisma.eRPSync.findUnique({ where: { id: logId } });
  if (!log) return;

  // We should actually import a queue, not the worker, but for now we'll simulate the state update
  // Ideally: await syncQueue.add('SYNC_ORDER', { orderId: log.entityId });

  await prisma.eRPSync.update({
    where: { id: logId },
    data: {
      status: "pending",
      attempts: log.attempts + 1,
      lastError: null,
    },
  });

  revalidatePath("/admin/sync-logs");
}
