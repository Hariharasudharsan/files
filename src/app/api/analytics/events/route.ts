import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/services/analytics-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Asynchronously track the event so we don't block the client
    // In a highly-scalable production app, this would go into a message queue (Kafka/Redis)
    analytics.trackEvent(body).catch(e => console.error(e));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
