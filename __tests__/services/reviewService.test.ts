import { reviewService } from '@/lib/reviewService';
import { prisma } from '@/lib/prisma';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    reviewHelpful: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    review: {
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('reviewService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('markAsHelpful', () => {
    it('should create a helpful mark and increment count', async () => {
      const reviewId = 'review-1';
      const userId = 'user-1';

      (prisma.reviewHelpful.create as jest.Mock).mockResolvedValue({});
      (prisma.review.update as jest.Mock).mockResolvedValue({});

      await reviewService.markAsHelpful(reviewId, userId);

      expect(prisma.reviewHelpful.create).toHaveBeenCalledWith({
        data: { reviewId, userId },
      });
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
    });
  });

  describe('removeHelpfulMark', () => {
    it('should remove a helpful mark and decrement count', async () => {
      const reviewId = 'review-1';
      const userId = 'user-1';

      (prisma.reviewHelpful.delete as jest.Mock).mockResolvedValue({});
      (prisma.review.update as jest.Mock).mockResolvedValue({});

      await reviewService.removeHelpfulMark(reviewId, userId);

      expect(prisma.reviewHelpful.delete).toHaveBeenCalledWith({
        where: { reviewId_userId: { reviewId, userId } },
      });
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      });
    });
  });

  describe('getProductReviews', () => {
    it('should return reviews with isHelpful status when userId is provided', async () => {
      const productId = 'prod-1';
      const userId = 'user-1';
      const reviews = [{ id: 'r1' }, { id: 'r2' }];
      const helpfulMarks = [{ reviewId: 'r1' }];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(reviews);
      (prisma.reviewHelpful.findMany as jest.Mock).mockResolvedValue(helpfulMarks);

      const result = await reviewService.getProductReviews(productId, userId);

      expect(result).toEqual([
        { id: 'r1', isHelpful: true },
        { id: 'r2', isHelpful: false },
      ]);
    });
  });
});
