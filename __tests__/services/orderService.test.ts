import { orderService } from '@/lib/orderService';
import { prisma } from '@/lib/prisma';
import { cartService } from '@/lib/cartService';
import { notificationService } from '@/lib/notificationService';

// Mock prisma and other services
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    order: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/cartService');
jest.mock('@/lib/notificationService');
jest.mock('@/lib/notifications', () => ({
  notifyOrderConfirmation: jest.fn(),
}));

describe('orderService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrderFromCart', () => {
    it('should create an order and clear the cart', async () => {
      const userId = 'user-1';
      const shippingAddress = 'Nairobi';
      const cartItems = [{ product_id: 'p1', quantity: 2, product_price: 100 }];
      const createdOrder = { id: 'order-1', amount: 200, status: 'PENDING' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'test@example.com' });
      (cartService.getCartItems as jest.Mock).mockResolvedValue(cartItems);
      (prisma.order.create as jest.Mock).mockResolvedValue(createdOrder);

      await orderService.createOrderFromCart(userId, shippingAddress);

      expect(prisma.order.create).toHaveBeenCalled();
      expect(cartService.clearCart).toHaveBeenCalledWith(userId);
      expect(notificationService.createOrderNotification).toHaveBeenCalled();
    });

    it('should throw error if cart is empty', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'test@example.com' });
      (cartService.getCartItems as jest.Mock).mockResolvedValue([]);

      await expect(orderService.createOrderFromCart('u1', 'addr')).rejects.toThrow('Cannot create order from empty cart');
    });
  });
});
