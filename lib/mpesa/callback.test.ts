import { processMpesaCallback } from './callback';
import { prisma } from '@/lib/prisma';
import { orderService } from '@/lib/orderService';
import { cartService } from '@/lib/cartService';
import { notificationService } from '@/lib/notificationService';
import { MpesaStatus, OrderStatus } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    mpesaTransaction: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    }
  },
}));

jest.mock('@/lib/orderService', () => ({
  orderService: {
    autoAssignTransporter: jest.fn(),
  },
}));

jest.mock('@/lib/cartService', () => ({
  cartService: {
    clearCart: jest.fn(),
  },
}));

jest.mock('@/lib/notificationService', () => ({
  notificationService: {
    createNotification: jest.fn(),
  },
}));

describe('MpesaCallback', () => {
  const mockPayload = {
    Body: {
      stkCallback: {
        MerchantRequestID: '123',
        CheckoutRequestID: 'ws_CO_123',
        ResultCode: 0,
        ResultDesc: 'Success',
        CallbackMetadata: {
          Item: [
            { Name: 'Amount', Value: 100 },
            { Name: 'MpesaReceiptNumber', Value: 'NLK8932HS' },
            { Name: 'TransactionDate', Value: 20241201120000 },
            { Name: 'PhoneNumber', Value: 254712345678 }
          ]
        }
      }
    }
  };

  const mockTransaction = {
    id: 'tx-1',
    orderId: 'order-1',
    userId: 'user-1',
    amount: 100,
    status: MpesaStatus.PENDING,
    order: { id: 'order-1', traderId: 'trader-1' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ResultCode 0 marks order PAID and clears cart', async () => {
    (prisma.mpesaTransaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);
    
    await processMpesaCallback(mockPayload as any);

    // Verify transaction updated
    expect(prisma.mpesaTransaction.update).toHaveBeenCalledWith({
      where: { checkoutRequestId: 'ws_CO_123' },
      data: expect.objectContaining({ status: MpesaStatus.COMPLETED, mpesaReceiptNumber: 'NLK8932HS' })
    });

    // Verify order status updated
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: OrderStatus.CONFIRMED }
    });

    // Verify cart cleared
    expect(cartService.clearCart).toHaveBeenCalledWith('user-1');

    // Verify auto-assign called
    expect(orderService.autoAssignTransporter).toHaveBeenCalledWith('order-1');

    // Verify notifications sent
    expect(notificationService.createNotification).toHaveBeenCalled();
  });

  test('ResultCode 1032 (cancelled) marks transaction FAILED', async () => {
    const cancelledPayload = {
      ...mockPayload,
      Body: {
        ...mockPayload.Body,
        stkCallback: {
          ...mockPayload.Body.stkCallback,
          ResultCode: 1032,
          ResultDesc: 'Request cancelled by user'
        }
      }
    };

    (prisma.mpesaTransaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);

    await processMpesaCallback(cancelledPayload as any);

    expect(prisma.mpesaTransaction.update).toHaveBeenCalledWith({
      where: { checkoutRequestId: 'ws_CO_123' },
      data: expect.objectContaining({ status: MpesaStatus.FAILED })
    });

    // Order status should NOT be confirmed
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  test('Duplicate request is ignored by processCallback if status is already FINAL', async () => {
    (prisma.mpesaTransaction.findUnique as jest.Mock).mockResolvedValue({
      ...mockTransaction,
      status: MpesaStatus.COMPLETED
    });

    await processMpesaCallback(mockPayload as any);

    // Should NOT update again
    expect(prisma.mpesaTransaction.update).not.toHaveBeenCalled();
  });
});
