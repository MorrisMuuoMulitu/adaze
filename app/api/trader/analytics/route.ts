export const dynamic = "force-dynamic";
import { auth } from '@/auth';
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

    // 1. Fetch total revenue from delivered orders
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          traderId,
          status: OrderStatus.DELIVERED
        }
      },
      include: {
        product: { select: { name: true } }
      }
    });

    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.quantity * Number(item.priceAtTime)), 0);

    // 2. Fetch active listings count
    const activeListingsCount = await prisma.product.count({
      where: { traderId }
    });

    // 3. Process top-selling products
    const productSalesMap = new Map<string, { total_quantity_sold: number; total_revenue: number; product_name: string }>();

    orderItems.forEach(item => {
      const productName = item.product?.name || 'Unknown Product';
      const currentSales = productSalesMap.get(productName) || { total_quantity_sold: 0, total_revenue: 0, product_name: productName };
      
      currentSales.total_quantity_sold += item.quantity;
      currentSales.total_revenue += (item.quantity * Number(item.priceAtTime));
      productSalesMap.set(productName, currentSales);
    });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    return NextResponse.json({
      totalRevenue,
      activeListingsCount,
      topSellingProducts
    });
  } catch (error: any) {
    console.error('Trader analytics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
