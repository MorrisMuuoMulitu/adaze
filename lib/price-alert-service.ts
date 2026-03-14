import { prisma } from "@/lib/prisma";
import { notificationService } from "./notificationService";

export const priceAlertService = {
  /**
   * Check for price drops and notify users
   */
  async checkPriceDrops() {
    console.log("🔍 Checking for price drops...");
    
    // Find all wishlist items where notifyOnPriceDrop is true
    const priceAlerts = await prisma.wishlist.findMany({
      where: {
        notifyOnPriceDrop: true,
      },
      include: {
        product: true,
        user: true,
      },
    });

    let notificationsSent = 0;

    for (const alert of priceAlerts) {
      const currentPrice = Number(alert.product.price);
      const originalPrice = alert.originalPrice ? Number(alert.originalPrice) : null;
      const targetPrice = alert.targetPrice ? Number(alert.targetPrice) : null;

      // Logic: If current price is lower than original price (when alert was set)
      // OR if current price is at or below target price
      if (
        (originalPrice && currentPrice < originalPrice) ||
        (targetPrice && currentPrice <= targetPrice)
      ) {
        // Only notify once per day for the same product drop
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (!alert.lastNotifiedAt || alert.lastNotifiedAt < oneDayAgo) {
          await notificationService.createPriceDropNotification(
            alert.userId,
            alert.productId,
            alert.product.name,
            originalPrice || currentPrice + 100, // Fallback if originalPrice is missing
            currentPrice
          );

          // Update last notified at
          await prisma.wishlist.update({
            where: { id: alert.id },
            data: { lastNotifiedAt: new Date() },
          });

          notificationsSent++;
        }
      }
    }

    console.log(`✅ Price check complete. Sent ${notificationsSent} notifications.`);
    return notificationsSent;
  },

  /**
   * Set a price alert for a wishlist item
   */
  async setPriceAlert(userId: string, productId: string, targetPrice?: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");

    return await prisma.wishlist.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        notifyOnPriceDrop: true,
        originalPrice: product.price,
        targetPrice: targetPrice || null,
      },
    });
  },

  /**
   * Disable price alert for a wishlist item
   */
  async disablePriceAlert(userId: string, productId: string) {
    return await prisma.wishlist.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        notifyOnPriceDrop: false,
      },
    });
  },
};
