"use client";

import { useState } from 'react';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Review } from '@/lib/reviewService';

interface ReviewFormProps {
  initialData?: Review;
  onSubmit: (data: {
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function ReviewForm({ initialData, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex items-center gap-4">
          <StarRating
            rating={rating}
            interactive
            onChange={setRating}
            size="lg"
          />
          {rating > 0 && (
            <span className="text-sm text-muted-foreground">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Review Title (Optional)</Label>
        <Input
          id="title"
          placeholder="Summarize your experience..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          {title.length}/100 characters
        </p>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Your Review (Optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts about this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {comment.length}/1000 characters
        </p>
      </div>

      {/* Photo Upload Placeholder */}
      {/* 
      <div className="space-y-2">
        <Label>Add Photos (Optional)</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Photo upload coming soon!
          </p>
        </div>
      </div>
      */}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex-1"
        >
          {submitting ? 'Submitting...' : initialData ? 'Update Review' : 'Submit Review'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
