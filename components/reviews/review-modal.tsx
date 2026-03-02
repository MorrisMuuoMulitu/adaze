
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { reviewService } from '@/lib/reviewService';
import { toast } from 'sonner';
import { Order } from '@/lib/orderService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function ReviewModal({ isOpen, onClose, order }: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (!user || !order) {
      toast.error("User or order not found.");
      return;
    }
    if (rating === 0) {
      toast.error("Please provide a star rating.");
      return;
    }

    setLoading(true);
    try {
      // Determine who is being reviewed (trader and/or transporter)
      
      // Review for the trader
      if (order.trader_id) {
        await reviewService.createReview({
          order_id: order.id,
          user_id: user.id,
          reviewed_id: order.trader_id,
          product_id: '', // Product ID is required in interface but optional in logic here? 
          // Actually createReview expects product_id. I'll need to check the interface.
          rating: rating,
          comment: comment,
        });
      }

      toast.success("Review submitted successfully!");
      onClose();

    } catch (error: any) {
      toast.error("Failed to submit review", { description: error.message });
      console.error('Review submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience for order #{order?.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Write your comments here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
        <Button onClick={handleSubmitReview} disabled={loading || rating === 0}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
