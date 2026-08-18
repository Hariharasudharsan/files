import { NextResponse } from "next/server";
import { orderSyncQueue, webhookQueue } from "@/lib/infrastructure/queue/bullmq";

import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const queues = [
      { name: "SYNC_ORDER", instance: orderSyncQueue },
      { name: "PROCESS_WEBHOOK", instance: webhookQueue },
    ];

    const stats = await Promise.all(
      queues.map(async (q) => {
        const counts = await q.instance.getJobCounts(
          "wait",
          "active",
          "completed",
          "failed",
          "delayed",
        );
        return {
          name: q.name,
          counts,
        };
      })
    );

    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
