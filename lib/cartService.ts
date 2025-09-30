import { createClient } from '@/lib/supabase/client';
import { ErrorHandler } from '@/lib/errorHandler';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
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
  private supabase = createClient();

  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      // First get the cart items
      const { data: cartData, error: cartError } = await this.supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cartError) {
        throw cartError;
      }

      // Get all unique product IDs
      const productIds = Array.from(new Set(cartData.map(item => item.product_id)));
      
      if (productIds.length === 0) {
        return [];
      }

      // Get product details for all cart items
      const { data: productData, error: productError } = await this.supabase
        .from('products')
        .select('id, name, price, image_url')
        .in('id', productIds);

      if (productError) {
        throw productError;
      }

      // Create a map for quick lookup
      const productMap = new Map(productData.map(product => [product.id, product]));

      // Combine cart items with product details
      return cartData.map(cartItem => {
        const product = productMap.get(cartItem.product_id);
        return {
          id: cartItem.id,
          user_id: cartItem.user_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          created_at: cartItem.created_at,
          updated_at: cartItem.updated_at,
          product_name: product?.name || 'Unknown Product',
          product_price: product?.price || 0,
          product_image_url: product?.image_url || null
        };
      });
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'CartService.getCartItems');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem | null> {
    try {
      // Check if item already exists in cart
      const { data: existingItem, error: selectError } = await this.supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw selectError;
      }

      let cartItem;
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        const { data, error } = await this.supabase
          .from('cart')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select('*')
          .single();
        
        if (error) throw error;
        cartItem = data;
      } else {
        // Insert new item
        const { data, error } = await this.supabase
          .from('cart')
          .insert([{ 
            user_id: userId, 
            product_id: productId, 
            quantity 
          }])
          .select('*')
          .single();
        
        if (error) throw error;
        cartItem = data;
      }

      // Get the product details to return a complete CartItem
      const { data: productData, error: productError } = await this.supabase
        .from('products')
        .select('name, price, image_url')
        .eq('id', productId)
        .single();

      if (productError) {
        throw productError;
      }

      // Return complete CartItem with product details
      return {
        id: cartItem.id,
        user_id: cartItem.user_id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        created_at: cartItem.created_at,
        updated_at: cartItem.updated_at,
        product_name: productData.name || 'Unknown Product',
        product_price: productData.price || 0,
        product_image_url: productData.image_url || null
      };
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'CartService.addToCart');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async updateQuantity(cartId: string, newQuantity: number): Promise<CartItem | null> {
    try {
      if (newQuantity <= 0) {
      await this.removeFromCart(cartId);
      return null;
    }

      // Get the current cart item to get the user_id and product_id
      const { data: currentItem, error: currentError } = await this.supabase
        .from('cart')
        .select('user_id, product_id')
        .eq('id', cartId)
        .single();

      if (currentError) {
        throw currentError;
      }

      // Update the quantity
      const { data, error } = await this.supabase
        .from('cart')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Get the product details to return a complete CartItem
      const { data: productData, error: productError } = await this.supabase
        .from('products')
        .select('name, price, image_url')
        .eq('id', currentItem.product_id)
        .single();

      if (productError) {
        throw productError;
      }

      // Return complete CartItem with product details
      return {
        id: data.id,
        user_id: data.user_id,
        product_id: data.product_id,
        quantity: data.quantity,
        created_at: data.created_at,
        updated_at: data.updated_at,
        product_name: productData.name || 'Unknown Product',
        product_price: productData.price || 0,
        product_image_url: productData.image_url || null
      };
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'CartService.updateQuantity');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async removeFromCart(cartId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'CartService.removeFromCart');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'CartService.clearCart');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async getCartSummary(userId: string): Promise<CartSummary> {
    try {
      const cartItems = await this.getCartItems(userId);
      
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = cartItems.reduce((sum, item) => sum + ((item.product_price || 0) * item.quantity), 0);

      return {
        items: cartItems,
        totalItems,
        totalAmount
      };
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'CartService.getCartSummary');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async getCartCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'CartService.getCartCount');
      // Don't show error toast for count as it's used frequently
      throw error;
    }
  }
}

export const cartService = new CartService();