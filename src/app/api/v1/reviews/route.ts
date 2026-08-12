import { NextResponse } from "next/server";
import { ReviewRepository } from "@/lib/repositories/review-repository";

const reviewRepo = new ReviewRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }

    const reviews = await reviewRepo.findByProductId(productId);

    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("[GET_REVIEWS]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
