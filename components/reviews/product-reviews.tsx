"use client";

import { useState, useEffect, useCallback } from 'react';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { reviewService, Review, ReviewStats } from '@/lib/reviewService';
import { useAuth } from '@/components/auth/auth-provider';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
  traderId?: string;
}

export function ProductReviews({ productId, traderId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [helpfulMarks, setHelpfulMarks] = useState<Set<string>>(new Set());
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const isTrader = user?.id === traderId;

  const loadReviews = useCallback(async () => {
    try {
      const data = await reviewService.getProductReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const loadStats = useCallback(async () => {
    try {
      const data = await reviewService.getReviewStats(productId);
      setStats(data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  }, [productId]);

  const checkCanReview = useCallback(async () => {
    if (!user) return;
    try {
      // Allow all logged-in users to review
      setCanReview(true);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  }, [user]);

  const loadUserReview = useCallback(async () => {
    if (!user) return;
    try {
      const review = await reviewService.getUserReview(user.id, productId);
      setUserReview(review);
    } catch (error) {
      console.error('Error loading user review:', error);
    }
  }, [user, productId]);

  useEffect(() => {
    loadReviews();
    loadStats();
    if (user) {
      checkCanReview();
      loadUserReview();
    }
  }, [productId, user, loadReviews, loadStats, checkCanReview, loadUserReview]);

  const handleReviewSubmit = async (reviewData: {
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) => {
    if (!user) return;

    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, reviewData);
        toast.success('Review updated successfully!');
      } else {
        await reviewService.createReview({
          product_id: productId,
          user_id: user.id,
          ...reviewData,
        });
        toast.success('Review submitted successfully!');
      }

      setShowReviewForm(false);
      setEditingReview(null);
      loadReviews();
      loadStats();
      loadUserReview();
      checkCanReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      toast.error('Please sign in to mark reviews as helpful');
      return;
    }

    try {
      await reviewService.markHelpful(reviewId, user.id);

      // Toggle helpful mark in local state
      const newMarks = new Set(helpfulMarks);
      if (newMarks.has(reviewId)) {
        newMarks.delete(reviewId);
      } else {
        newMarks.add(reviewId);
      }
      setHelpfulMarks(newMarks);

      // Reload reviews to get updated count
      loadReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast.error('Failed to mark review as helpful');
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      loadReviews();
      loadStats();
      loadUserReview();
      checkCanReview();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleReplyToReview = async (reviewId: string) => {
    const response = prompt('Enter your response to this review:');
    if (!response) return;

    try {
      await reviewService.addTraderResponse(reviewId, response);
      toast.success('Response added successfully!');
      loadReviews();
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response');
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                <div className="text-5xl font-bold mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating rating={stats.averageRating} size="lg" />
                <div className="text-sm text-muted-foreground mt-2">
                  Based on {stats.totalReviews} review
                  {stats.totalReviews !== 1 && 's'}
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.breakdown[rating as keyof typeof stats.breakdown];
                  const percentage = stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                  return (
                    <button
                      key={rating}
                      onClick={() =>
                        setFilterRating(filterRating === rating ? null : rating)
                      }
                      className={`flex items-center gap-3 w-full hover:bg-muted p-2 rounded transition-colors ${filterRating === rating ? 'bg-muted' : ''
                        }`}
                    >
                      <div className="flex items-center gap-1 min-w-[80px]">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Button */}
      {!showReviewForm && !userReview && user && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowReviewForm(true)}
            size="lg"
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Write a Review
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReview ? 'Edit Your Review' : 'Write a Review'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              initialData={editingReview || undefined}
              onSubmit={handleReviewSubmit}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Active Filter Badge */}
      {filterRating && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filterRating}-star reviews
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterRating(null)}
          >
            Clear filter
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {filterRating
                  ? `No ${filterRating}-star reviews yet`
                  : 'No reviews yet. Be the first to review this product!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onMarkHelpful={handleMarkHelpful}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onReply={handleReplyToReview}
              isMarkedHelpful={helpfulMarks.has(review.id)}
              canEdit={user?.id === review.user_id}
              canReply={isTrader && !review.trader_response}
            />
          ))
        )}
      </div>
    </div>
  );
}
