export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parallel fetch for dashboard stats
    const [
      allUsers,
      products,
      orders
    ] = await Promise.all([
      prisma.user.findMany({ select: { role: true } }),
      prisma.product.findMany({ select: { id: true } }), // Simplified for now
      prisma.order.findMany({ 
        select: { 
          id: true, 
          status: true, 
          amount: true, 
          createdAt: true 
        } 
      })
    ]);

    const buyers = allUsers.filter(u => u.role === 'BUYER').length;
    const traders = allUsers.filter(u => u.role === 'TRADER').length;
    const transporters = allUsers.filter(u => u.role === 'TRANSPORTER').length;

    // For products, we don't have a status field yet in the schema, 
    // so we'll assume all are active for now or mock it if needed.
    // In a real app, you'd add a 'status' field to the Product model.
    const activeProducts = products.length; 
    const pendingProducts = 0;

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.amount), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = deliveredOrders
      .filter(o => new Date(o.createdAt) >= today)
      .reduce((sum, order) => sum + Number(order.amount), 0);

    return NextResponse.json({
      totalUsers: allUsers.length,
      totalBuyers: buyers,
      totalTraders: traders,
      totalTransporters: transporters,
      totalProducts: products.length,
      activeProducts,
      pendingProducts,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      totalRevenue,
      todayRevenue,
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
