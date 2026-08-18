import { NextResponse } from "next/server";
import { ERPSyncService } from "@/lib/infrastructure/erpnext/erp-sync-service";

import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function POST() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const syncService = new ERPSyncService();
    
    // Fire and forget (or await if you want synchronous feedback for the admin panel)
    await syncService.processPendingSyncs();
    
    return NextResponse.json({ message: "Sync process completed successfully." });
  } catch (error: any) {
    console.error("Manual Sync Trigger Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
