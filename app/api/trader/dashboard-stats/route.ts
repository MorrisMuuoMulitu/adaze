export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id || session.user.role !== 'TRADER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const traderId = session.user.id;

    // Parallel fetch for trader dashboard stats
    const [
      activeProducts,
      orders,
      unreadNotifications
    ] = await Promise.all([
      prisma.product.count({ where: { traderId } }),
      prisma.order.findMany({
        where: { traderId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where: { userId: traderId, isRead: false } })
    ]);

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
    const totalSales = orders
      .filter(o => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    return NextResponse.json({
      activeProducts,
      pendingOrders,
      completedOrders,
      totalSales,
      recentOrders: orders.slice(0, 5),
      unreadNotifications
    });
  } catch (error: any) {
    console.error('Trader dashboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
