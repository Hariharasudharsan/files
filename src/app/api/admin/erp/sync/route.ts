import { NextResponse } from "next/server";
import { ERPSyncService } from "@/lib/core/application/erp-sync-service";

export async function POST() {
  try {
    const syncService = new ERPSyncService();
    
    // Fire and forget (or await if you want synchronous feedback for the admin panel)
    await syncService.processPendingSyncs();
    
    return NextResponse.json({ message: "Sync process completed successfully." });
  } catch (error: any) {
    console.error("Manual Sync Trigger Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
