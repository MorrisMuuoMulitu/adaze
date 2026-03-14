export const wishlistService = {
  isServer: typeof window === 'undefined',

  async addToWishlist(userId: string, productId: string) {
    if (!this.isServer) {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const product = await prisma.product.findUnique({ where: { id: productId } });
      
      return await prisma.wishlist.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {}, // Do nothing if already exists
        create: {
          userId,
          productId,
          originalPrice: product?.price || 0,
        },
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  async updatePriceAlert(userId: string, productId: string, notifyOnPriceDrop: boolean, targetPrice?: number) {
    if (!this.isServer) {
      const res = await fetch('/api/wishlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, notifyOnPriceDrop, targetPrice }),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      return await prisma.wishlist.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          notifyOnPriceDrop,
          targetPrice,
        },
      });
    } catch (error) {
      console.error('Error updating price alert:', error);
      throw error;
    }
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    if (!this.isServer) {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      return;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.wishlist.deleteMany({
        where: {
          userId,
          productId,
        },
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  async getWishlistItems(userId: string) {
    if (!this.isServer) {
      const res = await fetch('/api/wishlist');
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const data = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Map to maintain compatibility with existing interfaces if needed
      return data.map(item => ({
        id: item.id,
        user_id: item.userId,
        product_id: item.productId,
        created_at: item.createdAt,
        product: item.product,
      }));
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      throw error;
    }
  },

  async getWishlistCount(userId: string): Promise<number> {
    if (!this.isServer) {
      const items = await this.getWishlistItems(userId);
      return items.length;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      return await prisma.wishlist.count({
        where: { userId },
      });
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      throw error;
    }
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    if (!this.isServer) {
      const items = await this.getWishlistItems(userId);
      return items.some((item: any) => item.product_id === productId);
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const count = await prisma.wishlist.count({
        where: {
          userId,
          productId,
        },
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      throw error;
    }
  },
};