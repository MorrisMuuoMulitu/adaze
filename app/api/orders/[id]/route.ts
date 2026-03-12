export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { orderService } from '@/lib/orderService';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    if (detailed) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          trader: { select: { name: true } },
          transporter: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Format for OrderWithDetails compatibility
      const formattedOrder = {
        ...order,
        profiles: order.trader ? { full_name: order.trader.name || 'Trader' } : null,
        transporters: order.transporter ? { full_name: order.transporter.name || 'Transporter' } : null,
        order_items: order.items.map(item => ({
          quantity: item.quantity,
          price_at_time: Number(item.priceAtTime),
          products: {
            name: item.product.name,
          },
        })),
        amount: Number(order.amount),
        status: order.status.toLowerCase()
      };

      return NextResponse.json(formattedOrder);
    }

    const order = await orderService.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('API Order Detail Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
