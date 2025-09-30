import { createClient } from '@/lib/supabase/client';
import { ErrorHandler } from '@/lib/errorHandler';
import { notificationService } from '@/lib/notificationService';
import { cartService, CartItem } from '@/lib/cartService';

export interface Order {
  id: string;
  buyer_id: string;
  trader_id: string | null;
  transporter_id: string | null;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  shipping_address: string;
  billing_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface OrderFilters {
  status?: string;
  role?: 'buyer' | 'trader' | 'transporter';
  userId?: string;
}

class OrderService {
  public supabase = createClient();

  async getAllOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      let query = this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.userId) {
          switch (filters.role) {
            case 'buyer':
              query = query.eq('buyer_id', filters.userId);
              break;
            case 'trader':
              query = query.eq('trader_id', filters.userId);
              break;
            case 'transporter':
              query = query.eq('transporter_id', filters.userId);
              break;
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Order[];
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.getAllOrders');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as Order;
    } catch (error) {
      if ((error as any).code === 'PGRST116') {
        // Record not found
        return null;
      } else {
        const appError = ErrorHandler.handle(error, 'OrderService.getOrderById');
        ErrorHandler.showErrorToast(appError);
        throw error;
      }
    }
  }

  async createOrderFromCart(userId: string, shippingAddress: string, billingAddress?: string): Promise<Order | null> {
    try {
      // Get user's cart items
      const cartItems = await cartService.getCartItems(userId);
      
      if (cartItems.length === 0) {
        throw new Error('Cannot create order from empty cart');
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

      // Create the order
      const orderData = {
        buyer_id: userId,
        title: `Order from ${new Date().toLocaleDateString()}`,
        description: `Order with ${cartItems.length} items`,
        amount: totalAmount,
        shipping_address: shippingAddress,
        billing_address: billingAddress || null
      };

      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: (order as Order).id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.product_price
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // If order items fail, we should probably delete the order
        await this.deleteOrder((order as Order).id);
        throw itemsError;
      }

      // Clear the user's cart after successful order creation
      await cartService.clearCart(userId);

      // Create notification for the buyer
      await notificationService.createOrderNotification(
        userId,
        (order as Order).id,
        (order as Order).title,
        'pending'
      );

      return order as Order;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.createOrderFromCart');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order | null> {
    try {
      // Get the current order to check if status changed
      const currentOrder = await this.getOrderById(id);
      
      // Don't allow updating id, created_at
      const { id: _, created_at: __, ...updateData } = orderData as any;
      
      const { data, error } = await this.supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedOrder = data as Order;
      
      // If status changed, create notifications for relevant parties
      if (currentOrder && currentOrder.status !== updatedOrder.status) {
        await this.createStatusChangeNotifications(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.updateOrder');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  private async createStatusChangeNotifications(order: Order) {
    // Create notification for the buyer
    await notificationService.createOrderNotification(
      order.buyer_id,
      order.id,
      order.title,
      order.status
    );

    // Create notification for the trader if assigned
    if (order.trader_id) {
      await notificationService.createOrderNotification(
        order.trader_id,
        order.id,
        order.title,
        order.status
      );
    }

    // Create notification for the transporter if assigned
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
    try {
      const { error } = await this.supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.deleteOrder');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async assignOrderToTrader(orderId: string, traderId: string): Promise<Order | null> {
    try {
      // Get the order first to access title and buyer_id
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const { data, error } = await this.supabase
        .from('orders')
        .update({ trader_id: traderId, status: 'confirmed' })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedOrder = data as Order;
      
      // Create notification for the buyer that the order was confirmed
      await notificationService.createOrderNotification(
        order.buyer_id,
        updatedOrder.id,
        updatedOrder.title,
        updatedOrder.status
      );

      // Create notification for the trader
      await notificationService.createOrderNotification(
        traderId,
        updatedOrder.id,
        updatedOrder.title,
        updatedOrder.status
      );

      return updatedOrder;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.assignOrderToTrader');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async assignOrderToTransporter(orderId: string, transporterId: string): Promise<Order | null> {
    try {
      // Get the order first to access title and buyer_id
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const { data, error } = await this.supabase
        .from('orders')
        .update({ transporter_id: transporterId, status: 'in_transit' })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedOrder = data as Order;
      
      // Create notification for the buyer that the order is in transit
      await notificationService.createOrderNotification(
        order.buyer_id,
        updatedOrder.id,
        updatedOrder.title,
        updatedOrder.status
      );

      // Create notification for the transporter
      await notificationService.createOrderNotification(
        transporterId,
        updatedOrder.id,
        updatedOrder.title,
        updatedOrder.status
      );

      // Create notification for the trader who confirmed the order
      if (order.trader_id) {
        await notificationService.createOrderNotification(
          order.trader_id,
          updatedOrder.id,
          updatedOrder.title,
          updatedOrder.status
        );
      }

      return updatedOrder;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.assignOrderToTransporter');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async completeOrder(orderId: string): Promise<Order | null> {
    try {
      // Get the order first to access title and buyer_id
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const { data, error } = await this.supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedOrder = data as Order;
      
      // Create notification for the buyer that the order was delivered
      await notificationService.createOrderNotification(
        order.buyer_id,
        updatedOrder.id,
        updatedOrder.title,
        updatedOrder.status
      );

      // Create notification for the transporter
      if (order.transporter_id) {
        await notificationService.createOrderNotification(
          order.transporter_id,
          updatedOrder.id,
          updatedOrder.title,
          updatedOrder.status
        );
      }

      // Create notification for the trader
      if (order.trader_id) {
        await notificationService.createOrderNotification(
          order.trader_id,
          updatedOrder.id,
          updatedOrder.title,
          updatedOrder.status
        );
      }

      return updatedOrder;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.completeOrder');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async autoAssignTransporter(orderId: string): Promise<Order | null> {
    try {
      // 1. Get the order details
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Only auto-assign if status is confirmed and no transporter is assigned
      if (order.status !== 'confirmed' || order.transporter_id !== null) {
        return order; // No action needed
      }

      // Extract city from shipping address (simple approach: assume last part is city)
      const shippingAddressParts = order.shipping_address.split(',').map(part => part.trim());
      const targetCity = shippingAddressParts[shippingAddressParts.length - 2]; // Assuming city is second to last part

      let availableTransporters: { id: string; full_name: string; location: string; }[] | null = null;

      // Try to find transporters in the target city
      if (targetCity) {
        const { data, error } = await this.supabase
          .from('profiles')
          .select('id, full_name, location')
          .eq('role', 'transporter')
          .eq('location', targetCity); // Match by city

        if (error) {
          console.error('Error fetching transporters by city:', error);
        } else {
          availableTransporters = data;
        }
      }

      // Fallback: if no city-specific transporters or no city found, get all transporters
      if (!availableTransporters || availableTransporters.length === 0) {
        console.warn(`No transporters found for city: ${targetCity || 'N/A'}. Falling back to all available transporters.`);
        const { data, error } = await this.supabase
          .from('profiles')
          .select('id, full_name, location')
          .eq('role', 'transporter');
        
        if (error) {
          throw error;
        }
        availableTransporters = data;
      }

      if (!availableTransporters || availableTransporters.length === 0) {
        console.warn('No transporters available for auto-assignment.');
        return order; // No transporter to assign
      }

      // Pick a random transporter from the available ones
      const assignedTransporter = availableTransporters[Math.floor(Math.random() * availableTransporters.length)];

      // 3. Assign Transporter and update status
      const { data, error } = await this.supabase
        .from('orders')
        .update({ transporter_id: assignedTransporter.id, status: 'in_transit' })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedOrder = data as Order;

      // 4. Notify Transporter (and buyer/trader)
      await notificationService.createOrderNotification(
        assignedTransporter.id,
        updatedOrder.id,
        `New Delivery Assignment: ${updatedOrder.title}`,
        'in_transit'
      );
      // Also notify buyer and trader about status change
      await this.createStatusChangeNotifications(updatedOrder);

      return updatedOrder;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'OrderService.autoAssignTransporter');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async getDetailedOrderById(id: string): Promise<OrderWithDetails | null> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          profiles:trader_id (full_name),
          transporters:transporter_id (full_name),
          order_items (
            quantity,
            products (
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as OrderWithDetails;
    } catch (error) {
      if ((error as any).code === 'PGRST116') {
        // Record not found
        return null;
      } else {
        const appError = ErrorHandler.handle(error, 'OrderService.getDetailedOrderById');
        ErrorHandler.showErrorToast(appError);
        throw error;
      }
    }
  }
}

export const orderService = new OrderService();

export interface OrderWithDetails extends Order {
    profiles: { full_name: string } | null; // Trader's profile
    transporters: { full_name: string } | null; // Transporter's profile
    order_items: {
        quantity: number;
        price_at_time: number; // Add this line
        products: {
            name: string;
        };
    }[];
}