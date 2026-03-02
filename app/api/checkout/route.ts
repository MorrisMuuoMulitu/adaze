import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cartService } from '@/lib/cartService';
import { notificationService } from '@/lib/notificationService';
import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress, phoneNumber, notes } = await request.json();
    const userId = session.user.id;

    // 1. Get cart items with product info
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 2. Group items by traderId
    const itemsByTrader = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const traderId = item.product.traderId;
      if (!itemsByTrader.has(traderId)) {
        itemsByTrader.set(traderId, []);
      }
      itemsByTrader.get(traderId)?.push(item);
    }

    // 3. Create orders for each trader
    const createdOrders = [];
    for (const [traderId, items] of itemsByTrader) {
      const totalAmount = items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      const order = await prisma.order.create({
        data: {
          buyerId: userId,
          traderId,
          title: `Order for ${items.length} item(s)`,
          description: items.map(i => i.product.name).join(', ').substring(0, 200),
          amount: totalAmount,
          shippingAddress,
          status: OrderStatus.PENDING,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.product.price,
            })),
          },
        },
      });

      createdOrders.push(order);

      // Notify Buyer
      await notificationService.createNotification({
        user_id: userId,
        title: 'Order Placed',
        message: `Your order for "${order.title}" has been placed successfully.`,
        type: 'info',
        related_order_id: order.id
      });
    }

    // 4. Clear Cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    return NextResponse.json({ 
      success: true, 
      orders: createdOrders,
      orderId: createdOrders.length === 1 ? createdOrders[0].id : null 
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
