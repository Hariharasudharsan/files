import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET(req: NextRequest) {
  try {
    const requests = await prisma.sampleRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });
    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
