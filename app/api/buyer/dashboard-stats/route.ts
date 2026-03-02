export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date();

    // Fetch dashboard data in parallel
    const [
      activeOrders,
      completedOrders,
      wishlistCount,
      cartCount,
      ordersInRange
    ] = await Promise.all([
      prisma.order.count({
        where: {
          buyerId: userId,
          status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.IN_TRANSIT] }
        }
      }),
      prisma.order.count({
        where: {
          buyerId: userId,
          status: OrderStatus.DELIVERED
        }
      }),
      prisma.wishlist.count({ where: { userId } }),
      prisma.cartItem.count({ where: { userId } }),
      prisma.order.findMany({
        where: {
          buyerId: userId,
          createdAt: { gte: dateFrom, lte: dateTo }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const totalSpending = ordersInRange
      .filter(o => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    // Generate daily chart data for the range
    const chartData = [];
    const curr = new Date(dateFrom);
    while (curr <= dateTo) {
      const dateStr = curr.toDateString();
      const dayOrders = ordersInRange.filter(o => new Date(o.createdAt).toDateString() === dateStr);
      const daySpending = dayOrders
        .filter(o => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + Number(o.amount), 0);
      
      chartData.push({
        date: curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spending: daySpending,
        orders: dayOrders.length
      });
      curr.setDate(curr.getDate() + 1);
    }

    return NextResponse.json({
      stats: {
        activeOrders,
        completedOrders,
        wishlistItems: wishlistCount,
        cartItems: cartCount,
        totalSpending,
        weeklySpending: totalSpending, // Simple mapping for now
      },
      recentOrders: ordersInRange.slice(0, 10),
      spendingData: chartData
    });
  } catch (error: any) {
    console.error('Buyer dashboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
