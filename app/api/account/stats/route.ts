import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/stats
 * Get real statistics for the logged-in user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch stats in parallel
    const [
      ordersCount,
      totalSpentResult,
      wishlistCount,
      reviewsGiven,
      reviewsReceived
    ] = await Promise.all([
      // 1. Orders count
      prisma.order.count({
        where: { buyerId: userId }
      }),
      // 2. Total spent
      prisma.order.aggregate({
        where: { 
          buyerId: userId,
          status: { in: ['DELIVERED', 'CONFIRMED', 'IN_TRANSIT'] }
        },
        _sum: {
          amount: true
        }
      }),
      // 3. Wishlist count
      prisma.wishlist.count({
        where: { userId }
      }),
      // 4. Reviews given
      prisma.review.count({
        where: { reviewerId: userId }
      }),
      // 5. Reviews received (if trader)
      prisma.review.count({
        where: { reviewedId: userId }
      })
    ]);

    return NextResponse.json({
      ordersCount,
      totalSpent: Number(totalSpentResult._sum.amount || 0),
      wishlistCount,
      reviewsGiven,
      reviewsReceived
    });
  } catch (error: any) {
    console.error("[API/Account/Stats] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch account statistics" },
      { status: 500 }
    );
  }
}
