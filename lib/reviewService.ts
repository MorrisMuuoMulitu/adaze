export interface Review {
  id: string;
  product_id: string | null;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  verified_purchase: boolean;
  helpful_count: number;
  trader_response: string | null;
  trader_response_date: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
  user_name?: string;
  user_avatar?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const reviewService = {
  isServer: typeof window === 'undefined',

  privateMapPrismaToReview(r: any): Review {
    return {
      id: r.id,
      product_id: r.productId,
      user_id: r.reviewerId,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      images: r.images,
      verified_purchase: r.verifiedPurchase,
      helpful_count: r.helpfulCount,
      trader_response: r.traderResponse,
      trader_response_date: r.traderResponseDate,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      user_name: r.reviewer?.name || 'Anonymous',
      user_avatar: r.reviewer?.image || null,
    };
  },

  // Get all reviews for a product
  async getProductReviews(productId: string): Promise<Review[]> {
    if (!this.isServer) {
      const res = await fetch(`/api/products/${productId}/reviews`);
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const reviews = await prisma.review.findMany({
        where: { productId },
        include: {
          reviewer: {
            select: { name: true, image: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reviews.map(r => this.privateMapPrismaToReview(r));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // Get review statistics for a product
  async getReviewStats(productId: string): Promise<ReviewStats> {
    if (!this.isServer) {
      const res = await fetch(`/api/products/${productId}/review-stats`);
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const reviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalReviews = reviews.length;
      
      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = sum / totalReviews;

      const breakdown = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      return {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        breakdown,
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  },

  // Create a new review
  async createReview(review: {
    product_id?: string;
    user_id: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
    order_id?: string;
    reviewed_id: string;
  }): Promise<Review> {
    if (!this.isServer) {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      // Check if user has purchased the product (if product_id is provided)
      let verifiedPurchase = false;
      if (review.product_id) {
        const purchaseCount = await prisma.order.count({
          where: {
            buyerId: review.user_id,
            items: {
              some: {
                productId: review.product_id,
              },
            },
            status: 'DELIVERED',
          },
        });
        verifiedPurchase = purchaseCount > 0;
      }

      const data = await prisma.review.create({
        data: {
          productId: review.product_id || null,
          reviewerId: review.user_id,
          reviewedId: review.reviewed_id,
          orderId: review.order_id || null,
          rating: review.rating,
          title: review.title || null,
          comment: review.comment || null,
          images: review.images || [],
          verifiedPurchase,
        },
        include: {
          reviewer: {
            select: { name: true, image: true },
          },
        },
      });

      return this.privateMapPrismaToReview(data);
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Update a review
  async updateReview(
    reviewId: string,
    updates: {
      rating?: number;
      title?: string;
      comment?: string;
      images?: string[];
    }
  ): Promise<Review> {
    if (!this.isServer) {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const data = await prisma.review.update({
        where: { id: reviewId },
        data: {
          rating: updates.rating,
          title: updates.title,
          comment: updates.comment,
          images: updates.images,
        },
        include: {
          reviewer: {
            select: { name: true, image: true },
          },
        },
      });

      return this.privateMapPrismaToReview(data);
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    if (!this.isServer) {
      await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      return;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.review.delete({
        where: { id: reviewId },
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Add trader response to a review
  async addTraderResponse(reviewId: string, response: string): Promise<Review> {
    if (!this.isServer) {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const data = await prisma.review.update({
        where: { id: reviewId },
        data: {
          traderResponse: response,
          traderResponseDate: new Date(),
        },
        include: {
          reviewer: {
            select: { name: true, image: true },
          },
        },
      });

      return this.privateMapPrismaToReview(data);
    } catch (error) {
      console.error('Error adding trader response:', error);
      throw error;
    }
  },

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<void> {
    if (!this.isServer) {
      await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      return;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error('Error marking helpful:', error);
      throw error;
    }
  },

  // Get user's review for a product
  async getUserReview(userId: string, productId: string): Promise<Review | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/products/${productId}/reviews/user`);
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const data = await prisma.review.findFirst({
        where: {
          reviewerId: userId,
          productId: productId,
        },
        include: {
          reviewer: {
            select: { name: true, image: true },
          },
        },
      });

      return data ? this.privateMapPrismaToReview(data) : null;
    } catch (error) {
      console.error('Error fetching user review:', error);
      throw error;
    }
  },

  // Check if user can review (has purchased and hasn't reviewed yet)
  async canUserReview(userId: string, productId: string): Promise<boolean> {
    if (!this.isServer) {
      const res = await fetch(`/api/products/${productId}/can-review`);
      const data = await res.json();
      return data.canReview;
    }

    try {
      const existingReview = await this.getUserReview(userId, productId);
      if (existingReview) return false;

      const { prisma } = await import('@/lib/prisma');
      const purchaseCount = await prisma.order.count({
        where: {
          buyerId: userId,
          items: {
            some: {
              productId,
            },
          },
          status: 'DELIVERED',
        },
      });

      return purchaseCount > 0;
    } catch (error) {
      console.error('Error checking can review:', error);
      throw error;
    }
  },

  // Get average rating for a trader (across all their products)
  async getAverageRating(traderId: string): Promise<number | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/traders/${traderId}/rating`);
      const data = await res.json();
      return data.rating;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const result = await prisma.review.aggregate({
        where: {
          reviewedId: traderId,
        },
        _avg: {
          rating: true,
        },
      });

      return result._avg.rating ? Number(result._avg.rating.toFixed(1)) : null;
    } catch (error) {
      console.error('Error fetching trader rating:', error);
      return null;
    }
  },
};
