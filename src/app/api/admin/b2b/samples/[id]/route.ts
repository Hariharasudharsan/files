import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { SampleRequestStatus } from "@prisma/client";
import { checkApiPermission } from "@/lib/auth/rbac";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await checkApiPermission("b2b", "approve");
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const body = await req.json();
    
    if (!body.status || !Object.values(SampleRequestStatus).includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.sampleRequest.update({
      where: { id },
      data: { status: body.status },
    });
    
    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "B2B_SAMPLE_STATUS_UPDATED",
        entity: "SampleRequest",
        entityId: id,
        details: { status: body.status },
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

