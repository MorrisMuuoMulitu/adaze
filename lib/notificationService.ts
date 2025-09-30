import { createClient } from '@/lib/supabase/client';
import { ErrorHandler } from '@/lib/errorHandler';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_order_id?: string;
  created_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  related_order_id?: string;
}

class NotificationService {
  private supabase = createClient();

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Notification[];
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'NotificationService.getUnreadNotifications');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async getAllNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Notification[];
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'NotificationService.getAllNotifications');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async createNotification(notificationData: CreateNotificationData): Promise<Notification | null> {
    try {
      const notificationWithDefaults = {
        ...notificationData,
        type: notificationData.type || 'info'
      };

      const { data, error } = await this.supabase
        .from('notifications')
        .insert([notificationWithDefaults])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Notification;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'NotificationService.createNotification');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Notification;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'NotificationService.markAsRead');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'NotificationService.markAllAsRead');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'NotificationService.deleteNotification');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  // Create specific notification for order status changes
  async createOrderNotification(
    userId: string, 
    orderId: string, 
    orderTitle: string, 
    status: string
  ): Promise<Notification | null> {
    let title = '';
    let message = '';
    let type: 'info' | 'success' | 'warning' | 'error' = 'info';

    switch (status) {
      case 'confirmed':
        title = 'Order Confirmed';
        message = `Your order "${orderTitle}" has been confirmed by a trader.`;
        type = 'success';
        break;
      case 'in_transit':
        title = 'Order In Transit';
        message = `Your order "${orderTitle}" is now being delivered.`;
        type = 'info';
        break;
      case 'delivered':
        title = 'Order Delivered';
        message = `Your order "${orderTitle}" has been successfully delivered.`;
        type = 'success';
        break;
      case 'cancelled':
        title = 'Order Cancelled';
        message = `Your order "${orderTitle}" has been cancelled.`;
        type = 'error';
        break;
      default:
        title = 'Order Status Updated';
        message = `The status of your order "${orderTitle}" has been updated to ${status}.`;
        break;
    }

    return await this.createNotification({
      user_id: userId,
      title,
      message,
      type,
      related_order_id: orderId
    });
  }
}

export const notificationService = new NotificationService();