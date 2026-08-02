import { NextResponse } from 'next/server';
import { OutboxRelay } from '../../../../lib/infrastructure/events/OutboxRelay';

export async function GET() {
  try {
    await OutboxRelay.relayEvents();
    return NextResponse.json({ success: true, message: 'Outbox events relayed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
