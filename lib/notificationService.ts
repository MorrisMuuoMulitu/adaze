export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'price_drop' | 'new_message' | 'order_update';
  is_read: boolean;
  related_order_id?: string;
  related_product_id?: string;
  created_at: string | Date;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'price_drop' | 'new_message' | 'order_update';
  related_order_id?: string;
  related_product_id?: string;
}

class NotificationService {
  private isServer = typeof window === 'undefined';

  private mapPrismaToNotification(n: any): Notification {
    return {
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type.toLowerCase() as any,
      is_read: n.isRead,
      related_order_id: n.relatedOrderId || undefined,
      related_product_id: n.relatedProductId || undefined,
      created_at: n.createdAt,
    };
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    if (!this.isServer) {
      const res = await fetch('/api/notifications?unread=true');
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const data = await prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return data.map(n => this.mapPrismaToNotification(n));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  async getAllNotifications(userId: string): Promise<Notification[]> {
    if (!this.isServer) {
      const res = await fetch('/api/notifications');
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const data = await prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return data.map(n => this.mapPrismaToNotification(n));
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  }

  async createNotification(notificationData: CreateNotificationData): Promise<Notification | null> {
    if (!this.isServer) {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const { NotificationType } = await import('@prisma/client');
      const { user_id, title, message, type, related_order_id, related_product_id } = notificationData;

      let prismaType: any = NotificationType.INFO;
      if (type) {
        switch (type.toLowerCase()) {
          case 'success': prismaType = NotificationType.SUCCESS; break;
          case 'warning': prismaType = NotificationType.WARNING; break;
          case 'error': prismaType = NotificationType.ERROR; break;
          case 'price_drop': prismaType = NotificationType.PRICE_DROP; break;
          case 'new_message': prismaType = NotificationType.NEW_MESSAGE; break;
          case 'order_update': prismaType = NotificationType.ORDER_UPDATE; break;
        }
      }

      const data = await prisma.notification.create({
        data: {
          userId: user_id,
          title,
          message,
          type: prismaType,
          relatedOrderId: related_order_id,
          // Note: relatedProductId might need to be added to the prisma schema or handled as metadata
        },
      });

      return this.mapPrismaToNotification(data);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const data = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return this.mapPrismaToNotification(data);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    if (!this.isServer) {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      const data = await res.json();
      return data.success;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    if (!this.isServer) {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.notification.delete({
        where: { id: notificationId },
      });

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createOrderNotification(
    userId: string, 
    orderId: string, 
    orderTitle: string, 
    status: string
  ): Promise<Notification | null> {
    let title = '';
    let message = '';
    let type: any = 'order_update';

    switch (status.toLowerCase()) {
      case 'confirmed':
        title = 'Order Confirmed';
        message = `Your order "${orderTitle}" has been confirmed by a trader.`;
        break;
      case 'in_transit':
        title = 'Order In Transit';
        message = `Your order "${orderTitle}" is now being delivered.`;
        break;
      case 'delivered':
        title = 'Order Delivered';
        message = `Your order "${orderTitle}" has been successfully delivered.`;
        break;
      case 'cancelled':
        title = 'Order Cancelled';
        message = `Your order "${orderTitle}" has been cancelled.`;
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

  async createPriceDropNotification(
    userId: string,
    productId: string,
    productName: string,
    oldPrice: number,
    newPrice: number
  ): Promise<Notification | null> {
    const savings = oldPrice - newPrice;
    const percentage = Math.round((savings / oldPrice) * 100);

    return await this.createNotification({
      user_id: userId,
      title: 'Price Drop Alert!',
      message: `Great news! "${productName}" is now KSh ${newPrice.toLocaleString()} (Save ${percentage}% / KSh ${savings.toLocaleString()}).`,
      type: 'price_drop',
      related_product_id: productId
    });
  }

  async createMessageNotification(
    userId: string,
    senderName: string,
    conversationId: string,
    messageContent: string
  ): Promise<Notification | null> {
    return await this.createNotification({
      user_id: userId,
      title: `New message from ${senderName}`,
      message: messageContent.length > 50 ? messageContent.substring(0, 47) + '...' : messageContent,
      type: 'new_message',
      related_order_id: conversationId // Overloading related_order_id for simplicity or handle as metadata
    });
  }
}

export const notificationService = new NotificationService();