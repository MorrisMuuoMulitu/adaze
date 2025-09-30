import { createClient } from './supabase/client';
import { Product } from '@/types';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: Product[]; // Joined product data as an array
}

export const wishlistService = {
  async addToWishlist(userId: string, productId: string): Promise<WishlistItem | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wishlist')
      .insert({ user_id: userId, product_id: productId })
      .select()
      .single();

    if (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
    return data;
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        user_id,
        product_id,
        created_at,
        products:product_id (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist items:', error);
      throw error;
    }
    return data || [];
  },

  async getWishlistCount(userId: string): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('wishlist')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist count:', error);
      throw error;
    }
    return count || 0;
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('wishlist')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error checking wishlist status:', error);
      throw error;
    }
    return (count || 0) > 0;
  },
};