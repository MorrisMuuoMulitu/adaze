export const dynamic = "force-dynamic";import { auth } from '@/auth';
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

    // Parallel fetch for transporter dashboard stats
    const [
      orders,
      unreadNotifications
    ] = await Promise.all([
      prisma.order.findMany({
        where: { transporterId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where: { userId: transporterId, isRead: false } })
    ]);

    const activeDeliveries = orders.filter(o => o.status === OrderStatus.IN_TRANSIT).length;
    const completedDeliveries = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
    const pendingAssignments = orders.filter(o => o.status === OrderStatus.CONFIRMED).length;

    return NextResponse.json({
      activeDeliveries,
      completedDeliveries,
      pendingAssignments,
      recentDeliveries: orders.slice(0, 5),
      unreadNotifications
    });
  } catch (error: any) {
    console.error('Transporter dashboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
