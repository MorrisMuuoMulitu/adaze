"use client";

import { useState } from 'react';
import Image from 'next/image';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, MoreVertical } from 'lucide-react';
import { Review } from '@/lib/reviewService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: string) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  isMarkedHelpful?: boolean;
  canEdit?: boolean;
  canReply?: boolean;
}

export function ReviewCard({
  review,
  onMarkHelpful,
  onEdit,
  onDelete,
  onReply,
  isMarkedHelpful = false,
  canEdit = false,
  canReply = false,
}: ReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false);

  const commentPreviewLength = 200;
  const shouldTruncate =
    review.comment && review.comment.length > commentPreviewLength;

  const displayComment = shouldTruncate && !showFullComment
    ? review.comment!.substring(0, commentPreviewLength) + '...'
    : review.comment;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={review.user_avatar || undefined} />
              <AvatarFallback>
                {review.user_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{review.user_name}</span>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {(canEdit || canReply) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(review)}>
                      Edit Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(review.id)}
                      className="text-destructive"
                    >
                      Delete Review
                    </DropdownMenuItem>
                  </>
                )}
                {canReply && (
                  <DropdownMenuItem onClick={() => onReply?.(review.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply to Review
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {review.title && (
          <h4 className="font-semibold mb-2">{review.title}</h4>
        )}

        {review.comment && (
          <div className="mb-4">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {displayComment}
            </p>
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowFullComment(!showFullComment)}
                className="px-0 h-auto"
              >
                {showFullComment ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>
        )}

        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden border"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {review.trader_response && (
          <div className="mt-4 p-4 bg-muted rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Trader Response</span>
              {review.trader_response_date && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.trader_response_date), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {review.trader_response}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkHelpful?.(review.id)}
            className={isMarkedHelpful ? 'text-primary' : ''}
          >
            <ThumbsUp
              className={`h-4 w-4 mr-2 ${
                isMarkedHelpful ? 'fill-primary' : ''
              }`}
            />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
