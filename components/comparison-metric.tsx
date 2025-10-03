"use client";

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonMetricProps {
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percentage';
  inverse?: boolean; // If true, down is good (e.g., delivery time)
}

export function ComparisonMetric({ 
  current, 
  previous, 
  format = 'number',
  inverse = false 
}: ComparisonMetricProps) {
  const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  // Determine if this is "good" based on direction and inverse flag
  const isGood = inverse ? !isPositive : isPositive;

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `KSh ${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="text-xs">No change</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1",
      isGood ? "text-green-600" : "text-red-600"
    )}>
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span className="text-xs font-medium">
        {Math.abs(change).toFixed(1)}% {isPositive ? 'up' : 'down'}
      </span>
    </div>
  );
}
