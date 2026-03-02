export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { orderService } from '@/lib/orderService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const role = (searchParams.get('role') as any) || 'buyer';
    const detailed = searchParams.get('detailed') === 'true';

    if (detailed) {
      let where: any = {};
      if (role === 'trader') where = { traderId: session.user.id };
      else if (role === 'transporter') where = { transporterId: session.user.id };
      else where = { buyerId: session.user.id };

      const orders = await prisma.order.findMany({
        where,
        include: {
          buyer: { select: { name: true } },
          trader: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Map to compatible format if needed
      const formattedOrders = orders.map(o => ({
        ...o,
        profiles: o.buyer ? { full_name: o.buyer.name } : null,
        order_items: o.items.map(i => ({
          ...i,
          products: { name: i.product.name }
        }))
      }));

      return NextResponse.json(formattedOrders);
    }

    const orders = await orderService.getAllOrders({
      userId: session.user.id,
      role,
      status
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress, billingAddress } = await request.json();
    const order = await orderService.createOrderFromCart(
      session.user.id,
      shippingAddress,
      billingAddress
    );
    
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
