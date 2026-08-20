import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.businessName || !body.contactName || !body.email || !body.phone || !body.address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sampleRequest = await prisma.sampleRequest.create({
      data: {
        userId: body.userId || null,
        businessName: body.businessName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        notes: body.notes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(sampleRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
