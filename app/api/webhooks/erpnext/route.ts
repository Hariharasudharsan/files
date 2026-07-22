import { NextRequest, NextResponse } from "next/server";
import { enqueueErpSyncJob } from "@/lib/integrations/erp/sync-queue";
import { verifyErpWebhookSignature } from "@/lib/integrations/erp/webhook-security";
import { logger } from "@/lib/utils/logger";
import { validateErpWebhookPayload } from "@/lib/validation/webhooks";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature =
    request.headers.get("x-frappe-webhook-signature") ||
    request.headers.get("x-webhook-signature") ||
    request.headers.get("x-signature");

  if (!verifyErpWebhookSignature(body, signature)) {
    logger.warn("Rejected ERP webhook with invalid signature");
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const validation = validateErpWebhookPayload(JSON.parse(body));
    if (!validation.success) {
      return NextResponse.json(
        { error: "Webhook payload is invalid.", errors: validation.errors },
        { status: 400 }
      );
    }

    const event = validation.data;
    enqueueErpSyncJob({
      type: `${event.entity}.webhook`,
      payload: event,
    });

    return NextResponse.json({ success: true, queued: true }, { status: 202 });
  } catch (err) {
    logger.error("ERP webhook handling failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Webhook could not be processed." }, { status: 400 });
  }
}
