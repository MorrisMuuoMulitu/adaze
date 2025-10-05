import { createClient } from '@/lib/supabase/client';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[] | null;
  verified_purchase: boolean;
  helpful_count: number;
  trader_response: string | null;
  trader_response_date: string | null;
  created_at: string;
  updated_at: string;
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
  // Get all reviews for a product
  async getProductReviews(productId: string): Promise<Review[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    // Map the data to include user info
    return (data || []).map(review => ({
      ...review,
      user_name: review.profiles?.full_name || 'Anonymous',
      user_avatar: review.profiles?.avatar_url || null,
    }));
  },

  // Get review statistics for a product
  async getReviewStats(productId: string): Promise<ReviewStats> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }

    const reviews = data || [];
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
  },

  // Create a new review
  async createReview(review: {
    product_id: string;
    user_id: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<Review> {
    const supabase = createClient();

    // Check if user has purchased the product
    const { data: hasPurchased } = await supabase
      .rpc('has_purchased_product', {
        user_id_param: review.user_id,
        product_id_param: review.product_id,
      });

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...review,
        verified_purchase: hasPurchased || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    return data;
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
    const supabase = createClient();

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      throw error;
    }

    return data;
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Add trader response to a review
  async addTraderResponse(reviewId: string, response: string): Promise<Review> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('reviews')
      .update({
        trader_response: response,
        trader_response_date: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error adding trader response:', error);
      throw error;
    }

    return data;
  },

  // Mark review as helpful
  async markHelpful(reviewId: string, userId: string): Promise<void> {
    const supabase = createClient();

    // Check if already marked
    const { data: existing } = await supabase
      .from('review_helpful')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Remove mark (toggle)
      const { error } = await supabase
        .from('review_helpful')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Add mark
      const { error } = await supabase
        .from('review_helpful')
        .insert({ review_id: reviewId, user_id: userId });

      if (error) throw error;
    }
  },

  // Check if user marked review as helpful
  async isMarkedHelpful(reviewId: string, userId: string): Promise<boolean> {
    const supabase = createClient();

    const { data } = await supabase
      .from('review_helpful')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    return !!data;
  },

  // Get user's review for a product
  async getUserReview(userId: string, productId: string): Promise<Review | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user review:', error);
      throw error;
    }

    return data || null;
  },

  // Check if user can review (has purchased and hasn't reviewed yet)
  async canUserReview(userId: string, productId: string): Promise<boolean> {
    const supabase = createClient();

    // Check if already reviewed
    const existingReview = await this.getUserReview(userId, productId);
    if (existingReview) return false;

    // Check if purchased
    const { data: hasPurchased } = await supabase
      .rpc('has_purchased_product', {
        user_id_param: userId,
        product_id_param: productId,
      });

    return hasPurchased || false;
  },

  // Get average rating for a trader (across all their products)
  async getAverageRating(traderId: string): Promise<number | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('reviews')
      .select('rating, products!inner(trader_id)')
      .eq('products.trader_id', traderId);

    if (error) {
      console.error('Error fetching trader rating:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / data.length).toFixed(1));
  },
};
