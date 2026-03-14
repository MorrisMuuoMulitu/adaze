import { notificationService } from '@/lib/notificationService';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
  NotificationType: {
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    PRICE_DROP: 'PRICE_DROP',
  },
}));

describe('notificationService', () => {
  describe('createNotification', () => {
    it('should create a notification', async () => {
      const data = {
        user_id: 'u1',
        title: 'Test',
        message: 'Hello',
        type: 'info' as const,
      };

      (prisma.notification.create as jest.Mock).mockResolvedValue({
        ...data,
        id: 'n1',
        userId: 'u1',
        type: 'INFO',
        createdAt: new Date(),
        isRead: false,
      });

      await notificationService.createNotification(data);

      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('createPriceDropNotification', () => {
    it('should create a price drop notification with correct message', async () => {
      const spy = jest.spyOn(notificationService, 'createNotification').mockResolvedValue(null);

      await notificationService.createPriceDropNotification('u1', 'p1', 'Shirt', 1000, 800);

      expect(spy).toHaveBeenCalledWith({
        user_id: 'u1',
        title: 'Price Drop Alert!',
        message: expect.stringContaining('Save 20%'),
        type: 'price_drop',
        related_product_id: 'p1',
      });
    });
  });
});
