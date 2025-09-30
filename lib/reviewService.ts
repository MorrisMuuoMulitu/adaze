import { createClient } from '@/lib/supabase/client';
import { ErrorHandler } from '@/lib/errorHandler';

export interface Review {
  id: string;
  order_id: string | null;
  product_id: string | null;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

class ReviewService {
  private supabase = createClient();

  async getAverageRating(reviewedId: string): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_id', reviewedId);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / data.length;
      }
      return null;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'ReviewService.getAverageRating');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();