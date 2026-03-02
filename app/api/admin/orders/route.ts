export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        buyer: { select: { name: true, email: true } },
        trader: { select: { name: true } },
        transporter: { select: { name: true } },
        items: {
          include: { product: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to compatible format for existing component if needed
    const formattedOrders = orders.map(o => ({
      ...o,
      profiles: o.buyer ? { full_name: o.buyer.name, email: o.buyer.email } : null,
      traders: o.trader ? { full_name: o.trader.name } : null,
      transporters: o.transporter ? { full_name: o.transporter.name } : null,
      order_items: o.items.map(i => ({
        ...i,
        products: { name: i.product.name }
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
