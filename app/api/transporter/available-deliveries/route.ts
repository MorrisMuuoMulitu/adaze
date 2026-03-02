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

    // Fetch orders that are confirmed but don't have a transporter assigned yet
    // Or orders that are in the transporter's location
    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.CONFIRMED,
        transporterId: null
      },
      include: {
        trader: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to compatible format
    const formattedOrders = orders.map(o => ({
      ...o,
      profiles: o.trader ? { full_name: o.trader.name } : null,
      order_items: o.items.map(i => ({
        ...i,
        products: { name: i.product.name }
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error('Available deliveries error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
