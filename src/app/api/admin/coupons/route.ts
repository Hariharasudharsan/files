import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { CouponRepository } from "@/lib/repositories/coupon-repository";
import { z } from "zod";
import { createCouponSchema } from "@/lib/core/domain/schemas/admin";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.name !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createCouponSchema.parse(body);

    const repo = new CouponRepository();
    const coupon = await repo.create({
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderValue: data.minOrderValue,
      maxDiscount: data.maxDiscount,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      isActive: true,
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    console.error("[POST /api/admin/coupons]", error);
    import("@sentry/nextjs").then(Sentry => Sentry.captureException(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.name !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repo = new CouponRepository();
    const coupons = await repo.findAll();

    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/coupons]", error);
    import("@sentry/nextjs").then(Sentry => Sentry.captureException(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
