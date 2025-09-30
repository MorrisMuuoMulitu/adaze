import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/orderService';

class RealtimeOrderService {
  private supabase = createClient();
  private channel: any = null;

  // Function to subscribe to order changes
  subscribeToOrderChanges(
    userId: string,
    onOrderUpdate: (order: Order) => void,
    onError?: (error: any) => void
  ) {
    // Unsubscribe from any existing channel first
    this.unsubscribe();
    
    this.channel = this.supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${userId},trader_id=eq.${userId},transporter_id=eq.${userId}`, // This filter needs to be adjusted
        },
        (payload) => {
          console.log('Order updated in real-time:', payload);
          onOrderUpdate(payload.new as Order);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to order updates');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Error subscribing to order updates:', status);
          onError && onError(new Error(`Subscription error: ${status}`));
        }
      });

    return this.channel;
  }

  // More specific subscription for a single order
  subscribeToOrderUpdates(
    orderId: string,
    onOrderUpdate: (order: Order) => void,
    onError?: (error: any) => void
  ) {
    this.unsubscribe();
    
    this.channel = this.supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order updated in real-time:', payload);
          onOrderUpdate(payload.new as Order);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to order updates for order:', orderId);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Error subscribing to order updates:', status);
          onError && onError(new Error(`Subscription error: ${status}`));
        }
      });

    return this.channel;
  }

  // Subscribe to notifications for a user
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: any) => void,
    onError?: (error: any) => void
  ) {
    this.unsubscribe();
    
    this.channel = this.supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          onNotification(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Error subscribing to notifications:', status);
          onError && onError(new Error(`Subscription error: ${status}`));
        }
      });

    return this.channel;
  }

  // Unsubscribe from all channels
  unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

export const realtimeOrderService = new RealtimeOrderService();