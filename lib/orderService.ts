export interface Order {
  id: string;
  buyer_id: string;
  trader_id: string | null;
  transporter_id: string | null;
  title: string;
  description: string | null;
  amount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  shipping_address: string;
  billing_address: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string | Date;
}

export interface OrderFilters {
  status?: string;
  role?: 'buyer' | 'trader' | 'transporter';
  userId?: string;
}

export interface OrderWithDetails extends Order {
    profiles: { full_name: string } | null; // Trader's profile
    transporters: { full_name: string } | null; // Transporter's profile
    order_items: {
        quantity: number;
        price_at_time: number;
        products: {
            name: string;
        };
    }[];
}

class OrderService {
  private isServer = typeof window === 'undefined';

  private mapPrismaToOrder(o: any): Order {
    return {
      id: o.id,
      buyer_id: o.buyerId,
      trader_id: o.traderId,
      transporter_id: o.transporterId,
      title: o.title,
      description: o.description,
      amount: Number(o.amount),
      status: o.status.toLowerCase() as any,
      shipping_address: o.shippingAddress,
      billing_address: o.billingAddress,
      created_at: o.createdAt,
      updated_at: o.updatedAt,
    };
  }

  async getAllOrders(filters?: OrderFilters): Promise<Order[]> {
    if (!this.isServer) {
      const url = new URL('/api/orders', window.location.origin);
      if (filters) {
        if (filters.status) url.searchParams.set('status', filters.status);
        if (filters.role) url.searchParams.set('role', filters.role);
      }
      const res = await fetch(url.toString());
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const { OrderStatus } = await import('@prisma/client');
      const where: any = {};
      
      if (filters) {
        if (filters.status) {
          const upperStatus = filters.status.toUpperCase();
          if (upperStatus in OrderStatus) {
            where.status = upperStatus as any;
          }
        }
        
        if (filters.userId) {
          switch (filters.role) {
            case 'buyer':
              where.buyerId = filters.userId;
              break;
            case 'trader':
              where.traderId = filters.userId;
              break;
            case 'transporter':
              where.transporterId = filters.userId;
              break;
          }
        }
      }

      const orders = await prisma.order.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return orders.map(o => this.mapPrismaToOrder(o));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/orders/${id}`);
      if (res.status === 404) return null;
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) return null;
      return this.mapPrismaToOrder(order);
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  async createOrderFromCart(userId: string, shippingAddress: string, billingAddress?: string): Promise<Order | null> {
    if (!this.isServer) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress, billingAddress }),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const { OrderStatus } = await import('@prisma/client');
      const { cartService } = await import('@/lib/cartService');
      const { notificationService } = await import('@/lib/notificationService');

      const cartItems = await cartService.getCartItems(userId);
      
      if (cartItems.length === 0) {
        throw new Error('Cannot create order from empty cart');
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

      const order = await prisma.order.create({
        data: {
          buyerId: userId,
          title: `Order from ${new Date().toLocaleDateString()}`,
          description: `Order with ${cartItems.length} items`,
          amount: totalAmount,
          shippingAddress: shippingAddress,
          billingAddress: billingAddress || null,
          status: OrderStatus.PENDING,
          items: {
            create: cartItems.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              priceAtTime: item.product_price,
            })),
          },
        },
      });

      await cartService.clearCart(userId);

      await notificationService.createOrderNotification(
        userId,
        order.id,
        order.title,
        'pending'
      );

      return this.mapPrismaToOrder(order);
    } catch (error) {
      console.error('Error creating order from cart:', error);
      throw error;
    }
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const { OrderStatus } = await import('@prisma/client');

      const currentOrder = await this.getOrderById(id);
      
      const updateData: any = {};
      if (orderData.status) {
        const upperStatus = orderData.status.toUpperCase();
        if (upperStatus in OrderStatus) {
          updateData.status = upperStatus as any;
        }
      }
      if (orderData.title) updateData.title = orderData.title;
      if (orderData.description) updateData.description = orderData.description;
      if (orderData.amount) updateData.amount = orderData.amount;
      if (orderData.shipping_address) updateData.shippingAddress = orderData.shipping_address;
      if (orderData.billing_address) updateData.billingAddress = orderData.billing_address;
      if (orderData.trader_id) updateData.traderId = orderData.trader_id;
      if (orderData.transporter_id) updateData.transporterId = orderData.transporter_id;

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
      });

      const formattedOrder = this.mapPrismaToOrder(updatedOrder);
      
      if (currentOrder && currentOrder.status !== formattedOrder.status) {
        await this.createStatusChangeNotifications(formattedOrder);
      }

      return formattedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  private async createStatusChangeNotifications(order: Order) {
    const { notificationService } = await import('@/lib/notificationService');
    await notificationService.createOrderNotification(
      order.buyer_id,
      order.id,
      order.title,
      order.status
    );

    if (order.trader_id) {
      await notificationService.createOrderNotification(
        order.trader_id,
        order.id,
        order.title,
        order.status
      );
    }

    if (order.transporter_id) {
      await notificationService.createOrderNotification(
        order.transporter_id,
        order.id,
        order.title,
        order.status
      );
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    if (!this.isServer) {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.order.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  async assignOrderToTrader(orderId: string, traderId: string): Promise<Order | null> {
    try {
      const { prisma } = await import('@/lib/prisma');
      const { OrderStatus } = await import('@prisma/client');
      const { notificationService } = await import('@/lib/notificationService');

      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { traderId, status: OrderStatus.CONFIRMED },
      });

      const formattedOrder = this.mapPrismaToOrder(updatedOrder);
      
      await notificationService.createOrderNotification(
        order.buyer_id,
        formattedOrder.id,
        formattedOrder.title,
        formattedOrder.status
      );

      await notificationService.createOrderNotification(
        traderId,
        formattedOrder.id,
        formattedOrder.title,
        formattedOrder.status
      );

      return formattedOrder;
    } catch (error) {
      console.error('Error assigning order to trader:', error);
      throw error;
    }
  }

  async assignOrderToTransporter(orderId: string, transporterId: string): Promise<Order | null> {
    try {
      const { prisma } = await import('@/lib/prisma');
      const { OrderStatus } = await import('@prisma/client');
      const { notificationService } = await import('@/lib/notificationService');

      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { transporterId, status: OrderStatus.IN_TRANSIT },
      });

      const formattedOrder = this.mapPrismaToOrder(updatedOrder);
      
      await notificationService.createOrderNotification(
        order.buyer_id,
        formattedOrder.id,
        formattedOrder.title,
        formattedOrder.status
      );

      await notificationService.createOrderNotification(
        transporterId,
        formattedOrder.id,
        formattedOrder.title,
        formattedOrder.status
      );

      if (order.trader_id) {
        await notificationService.createOrderNotification(
          order.trader_id,
          formattedOrder.id,
          formattedOrder.title,
          formattedOrder.status
        );
      }

      return formattedOrder;
    } catch (error) {
      console.error('Error assigning order to transporter:', error);
      throw error;
    }
  }

  async completeOrder(orderId: string): Promise<Order | null> {
    try {
      const { prisma } = await import('@/lib/prisma');
      const { OrderStatus } = await import('@prisma/client');
      const { notificationService } = await import('@/lib/notificationService');

      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DELIVERED },
      });

      const formattedOrder = this.mapPrismaToOrder(updatedOrder);
      
      await notificationService.createOrderNotification(
        order.buyer_id,
        formattedOrder.id,
        formattedOrder.title,
        formattedOrder.status
      );

      if (order.transporter_id) {
        await notificationService.createOrderNotification(
          order.transporter_id,
          formattedOrder.id,
          formattedOrder.title,
          formattedOrder.status
        );
      }

      if (order.trader_id) {
        await notificationService.createOrderNotification(
          order.trader_id,
          formattedOrder.id,
          formattedOrder.title,
          formattedOrder.status
        );
      }

      return formattedOrder;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  async autoAssignTransporter(orderId: string): Promise<Order | null> {
    try {
      const { prisma } = await import('@/lib/prisma');
      const { OrderStatus } = await import('@prisma/client');

      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'confirmed' || order.transporter_id !== null) {
        return order;
      }

      const shippingAddressParts = order.shipping_address.split(',').map(part => part.trim());
      const targetCity = shippingAddressParts[shippingAddressParts.length - 2];

      let availableTransporters = await prisma.user.findMany({
        where: {
          role: 'TRANSPORTER',
          location: targetCity,
        },
        select: { id: true, name: true, location: true },
      });

      if (availableTransporters.length === 0) {
        availableTransporters = await prisma.user.findMany({
          where: { role: 'TRANSPORTER' },
          select: { id: true, name: true, location: true },
        });
      }

      if (availableTransporters.length === 0) {
        return order;
      }

      const assignedTransporter = availableTransporters[Math.floor(Math.random() * availableTransporters.length)];

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { transporterId: assignedTransporter.id, status: OrderStatus.IN_TRANSIT },
      });

      const formattedOrder = this.mapPrismaToOrder(updatedOrder);

      const { notificationService } = await import('@/lib/notificationService');
      await notificationService.createOrderNotification(
        assignedTransporter.id,
        formattedOrder.id,
        `New Delivery Assignment: ${formattedOrder.title}`,
        'in_transit'
      );
      
      await this.createStatusChangeNotifications(formattedOrder);

      return formattedOrder;
    } catch (error) {
      console.error('Error auto-assigning transporter:', error);
      throw error;
    }
  }

  async getDetailedOrderById(id: string): Promise<OrderWithDetails | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/orders/${id}?detailed=true`);
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          trader: { select: { name: true } },
          transporter: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      });

      if (!order) return null;

      const baseOrder = this.mapPrismaToOrder(order);

      return {
        ...baseOrder,
        profiles: order.trader ? { full_name: order.trader.name || 'Trader' } : null,
        transporters: order.transporter ? { full_name: order.transporter.name || 'Transporter' } : null,
        order_items: order.items.map(item => ({
          quantity: item.quantity,
          price_at_time: Number(item.priceAtTime),
          products: {
            name: item.product.name,
          },
        })),
      };
    } catch (error) {
      console.error('Error fetching detailed order:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
