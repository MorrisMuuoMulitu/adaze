export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string | Date;
  updated_at: string | Date;
  // Additional product info
  product_name: string;
  product_price: number;
  product_image_url: string | null;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

class CartService {
  private isServer = typeof window === 'undefined';

  private mapPrismaToCartItem(item: any): CartItem {
    return {
      id: item.id,
      user_id: item.userId,
      product_id: item.productId,
      quantity: item.quantity,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      product_name: item.product?.name || 'Unknown Product',
      product_price: Number(item.product?.price) || 0,
      product_image_url: item.product?.imageUrl || null,
    };
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    if (!this.isServer) {
      const res = await fetch('/api/cart');
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return cartItems.map(item => this.mapPrismaToCartItem(item));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem | null> {
    if (!this.isServer) {
      const res = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const cartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          quantity: {
            increment: quantity,
          },
        },
        create: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: true,
        },
      });

      return this.mapPrismaToCartItem(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateQuantity(cartId: string, newQuantity: number): Promise<CartItem | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/cart/${cartId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQuantity }),
      });
      return res.json();
    }

    try {
      if (newQuantity <= 0) {
        await this.removeFromCart(cartId);
        return null;
      }

      const { prisma } = await import('@/lib/prisma');
      const cartItem = await prisma.cartItem.update({
        where: { id: cartId },
        data: { quantity: newQuantity },
        include: {
          product: true,
        },
      });

      return this.mapPrismaToCartItem(cartItem);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  }

  async removeFromCart(cartId: string): Promise<boolean> {
    if (!this.isServer) {
      const res = await fetch(`/api/cart/${cartId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.cartItem.delete({
        where: { id: cartId },
      });
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    if (!this.isServer) {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.cartItem.deleteMany({
        where: { userId },
      });
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async getCartSummary(userId: string): Promise<CartSummary> {
    try {
      const cartItems = await this.getCartItems(userId);
      
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

      return {
        items: cartItems,
        totalItems,
        totalAmount
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      throw error;
    }
  }

  async getCartCount(userId: string): Promise<number> {
    if (!this.isServer) {
      const items = await this.getCartItems(userId);
      return items.length;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      return await prisma.cartItem.count({
        where: { userId },
      });
    } catch (error) {
      console.error('Error getting cart count:', error);
      throw error;
    }
  }
}

export const cartService = new CartService();