import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { reviewService } from "@/lib/reviewService";

/**
 * POST /api/reviews/[id]/helpful
 * Mark a review as helpful
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reviewId = params.id;
    const userId = session.user.id;

    // Check if already marked as helpful
    const isHelpful = await reviewService.hasMarkedAsHelpful(reviewId, userId);
    if (isHelpful) {
      return NextResponse.json({ message: "Already marked as helpful" }, { status: 400 });
    }

    await reviewService.markAsHelpful(reviewId, userId);

    return NextResponse.json({ message: "Marked as helpful" });
  } catch (error: any) {
    console.error("[API/Reviews/Helpful] POST Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to mark as helpful" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]/helpful
 * Remove helpful mark from a review
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reviewId = params.id;
    const userId = session.user.id;

    // Check if marked as helpful
    const isHelpful = await reviewService.hasMarkedAsHelpful(reviewId, userId);
    if (!isHelpful) {
      return NextResponse.json({ message: "Not marked as helpful" }, { status: 400 });
    }

    await reviewService.removeHelpfulMark(reviewId, userId);

    return NextResponse.json({ message: "Helpful mark removed" });
  } catch (error: any) {
    console.error("[API/Reviews/Helpful] DELETE Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to remove helpful mark" },
      { status: 500 }
    );
  }
}
