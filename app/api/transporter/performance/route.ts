export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id || session.user.role !== 'TRANSPORTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transporterId = session.user.id;

    // Fetch performance metrics
    const [
      deliveredCount,
      totalOrders,
      reviews
    ] = await Promise.all([
      prisma.order.count({
        where: {
          transporterId,
          status: OrderStatus.DELIVERED
        }
      }),
      prisma.order.count({
        where: { transporterId }
      }),
      prisma.review.findMany({
        where: { reviewedId: transporterId },
        select: { rating: true }
      })
    ]);

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({
      deliveredCount,
      totalOrders,
      averageRating: Number(averageRating.toFixed(1)),
      reviewCount: reviews.length
    });
  } catch (error: any) {
    console.error('Transporter performance error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
