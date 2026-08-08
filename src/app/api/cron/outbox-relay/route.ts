import { NextResponse } from 'next/server';
import { processOutbox } from '../../../../lib/infrastructure/workers/OutboxWorker';
import { registerAuditSubscriber } from '../../../../lib/infrastructure/events/subscribers/AuditSubscriber';

// Ensure subscribers are registered (this runs once per lambda container if outside handler, but we can call it safely if it's idempotent or just once)
// Wait, eventBus in Next.js might be re-initialized. It's better to register once. Let's just call it.
registerAuditSubscriber();

export async function GET() {
  try {
    await processOutbox();
    return NextResponse.json({ success: true, message: 'Outbox events processed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
