export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_order_id?: string;
  created_at: string | Date;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  related_order_id?: string;
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
      const { user_id, title, message, type, related_order_id } = notificationData;
      
      let prismaType: any = NotificationType.INFO;
      if (type) {
        switch (type.toLowerCase()) {
          case 'success': prismaType = NotificationType.SUCCESS; break;
          case 'warning': prismaType = NotificationType.WARNING; break;
          case 'error': prismaType = NotificationType.ERROR; break;
        }
      }

      const data = await prisma.notification.create({
        data: {
          userId: user_id,
          title,
          message,
          type: prismaType,
          relatedOrderId: related_order_id,
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
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
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
      const res = await fetch('/api/notifications', {
        method: 'PUT',
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