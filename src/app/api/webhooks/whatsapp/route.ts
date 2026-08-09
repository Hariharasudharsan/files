import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "mathuram_secure_token";

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
    const body = await req.json();

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
              console.log(`[WhatsApp Webhook] Received message from ${phone}: ${text}`);
              
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
            console.log(`[WhatsApp Webhook] Message ${status.id} status: ${status.status}`);
          }
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function handleOptOut(phone: string) {
  // Strip country code if necessary based on how we store it, 
  // for now assume exact match or partial match
  console.log(`[WhatsApp Webhook] Opting out user with phone ${phone}`);
  // In a real scenario, we'd update NotificationPreference where user.phone == phone
}

async function routeToSupport(phone: string, text: string) {
  // Save to local database for admin panel viewing
  await prisma.auditLog.create({
    data: {
      action: "WHATSAPP_INBOUND",
      entity: "Support",
      entityId: phone,
      details: { message: text }
    }
  });
  console.log(`[WhatsApp Webhook] Routed to support ticket for ${phone}`);
}
