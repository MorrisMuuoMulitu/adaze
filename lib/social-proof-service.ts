import { prisma } from "@/lib/prisma";

export const socialProofService = {
  /**
   * Track a product view
   */
  async trackView(productId: string, userId?: string, sessionId?: string) {
    try {
      const { prisma } = await import('@/lib/prisma');
      
      return await prisma.$transaction([
        // 1. Create view record
        prisma.productView.create({
          data: {
            productId,
            userId,
            sessionId,
          },
        }),
        // 2. Increment product viewCount
        prisma.product.update({
          where: { id: productId },
          data: {
            viewCount: { increment: 1 },
          },
        }),
      ]);
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  },

  /**
   * Get social proof data for a product
   */
  async getProductSocialProof(productId: string) {
    try {
      const { prisma } = await import('@/lib/prisma');
      
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        recentViews,
        recentPurchases,
        totalViews
      ] = await Promise.all([
        // 1. Views in last 24 hours
        prisma.productView.count({
          where: {
            productId,
            viewedAt: { gte: twentyFourHoursAgo },
          },
        }),
        // 2. Purchases in last 24 hours
        prisma.orderItem.count({
          where: {
            productId,
            createdAt: { gte: twentyFourHoursAgo },
          },
        }),
        // 3. Total views
        prisma.product.findUnique({
          where: { id: productId },
          select: { viewCount: true },
        }),
      ]);

      return {
        recentViews,
        recentPurchases,
        totalViews: totalViews?.viewCount || 0,
      };
    } catch (error) {
      console.error('Error getting product social proof:', error);
      return { recentViews: 0, recentPurchases: 0, totalViews: 0 };
    }
  },

  /**
   * Get global social proof (e.g., "15 people bought items in the last hour")
   */
  async getGlobalSocialProof() {
    try {
      const { prisma } = await import('@/lib/prisma');
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const [
        recentSales,
        activeViewers
      ] = await Promise.all([
        prisma.order.count({
          where: {
            createdAt: { gte: oneHourAgo },
            status: { not: 'CANCELLED' },
          },
        }),
        prisma.productView.count({
          where: {
            viewedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 mins
          },
        }),
      ]);

      return {
        recentSales,
        activeViewers,
      };
    } catch (error) {
      console.error('Error getting global social proof:', error);
      return { recentSales: 0, activeViewers: 0 };
    }
  }
};
