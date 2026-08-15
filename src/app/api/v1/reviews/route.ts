import { NextResponse } from "next/server";
import { ReviewRepository } from "@/lib/repositories/review-repository";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, title, comment } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { success: false, error: "productId and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await reviewRepo.create({
      productId,
      userId: session.user.id,
      rating,
      title,
      comment,
      isApproved: false // Require moderation by default
    });

    return NextResponse.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error("[POST_REVIEW]", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
