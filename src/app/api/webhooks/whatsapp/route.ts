import { NextRequest, NextResponse } from "next/server";
import { AuditLogRepository } from "@/lib/repositories/audit-log-repository";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";
import crypto from "crypto";
import { Logger } from "@/lib/infrastructure/logger";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

/**
 * GET handler for Meta Cloud API Webhook Verification
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST handler for receiving WhatsApp messages, status updates, and opt-outs
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const limit = parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || "50");
    const windowSec = parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_SEC || "60");
    const { success } = await RateLimiter.check(`ratelimit:webhook:whatsapp:${ip}`, limit, windowSec);
    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    const signature = req.headers.get("x-hub-signature-256");
    if (!signature || !process.env.WHATSAPP_APP_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bodyText = await req.text();
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
      .update(bodyText)
      .digest("hex")}`;

    // Secure timing-safe comparison
    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    } catch (e) {
      // Length mismatch throws
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = JSON.parse(bodyText);

    if (body.object !== "whatsapp_business_account") {
      return new NextResponse("Not Found", { status: 404 });
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        // 1. Handle incoming text messages (Customer Support Handoff)
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            const phone = message.from;
            const text = message.text?.body;
            
            if (text) {
              Logger.info(`[WhatsApp Webhook] Received message from ${phone}`, { text });
              
              // Handle Opt-Out
              if (text.trim().toLowerCase() === "stop") {
                await handleOptOut(phone);
              } else {
                await routeToSupport(phone, text);
              }
            }
          }
        }

        // 2. Handle Message Status Updates (Delivered, Read, Failed)
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            Logger.info(`[WhatsApp Webhook] Message ${status.id} status: ${status.status}`);
          }
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    Logger.error("WhatsApp Webhook Error", { error: error.message });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function handleOptOut(phone: string) {
  // Strip country code if necessary based on how we store it, 
  // for now assume exact match or partial match
  Logger.info(`[WhatsApp Webhook] Opting out user with phone ${phone}`);
  // In a real scenario, we'd update NotificationPreference where user.phone == phone
}

async function routeToSupport(phone: string, text: string) {
  // Save to local database for admin panel viewing
  await AuditLogRepository.createLog({
    action: "WHATSAPP_INBOUND",
    entity: "Support",
    entityId: phone,
    details: { message: text }
  });
  Logger.info(`[WhatsApp Webhook] Routed to support ticket for ${phone}`);
}
