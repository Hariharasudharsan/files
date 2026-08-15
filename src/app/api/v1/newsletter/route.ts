import { NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Upsert to handle re-subscriptions gracefully
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email }
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter!"
    });
  } catch (error) {
    console.error("[POST_NEWSLETTER]", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
