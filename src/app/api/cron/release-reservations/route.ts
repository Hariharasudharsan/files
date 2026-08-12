import { NextResponse } from 'next/server';
import { releaseExpiredReservations } from '../../../../lib/infrastructure/workers/InventoryWorker';

export async function GET() {
  try {
    const releasedCount = await releaseExpiredReservations();
    return NextResponse.json({ success: true, message: `Successfully released ${releasedCount} expired reservations` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
