"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Package, Truck, XCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface TimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp?: string | Date;
  description?: string;
}

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  events?: TimelineEvent[];
  createdAt: string | Date;
  confirmedAt?: string | Date;
  shippedAt?: string | Date;
  deliveredAt?: string | Date;
  cancelledAt?: string | Date;
}

const defaultSteps: Record<OrderStatus, { label: string; icon: any; color: string }> = {
  pending: { label: 'Order Placed', icon: Clock, color: 'text-yellow-600' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600' },
  delivered: { label: 'Delivered', icon: Package, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
};

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export function OrderTimeline({
  currentStatus,
  createdAt,
  confirmedAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
  events
}: OrderTimelineProps) {
  // Build timeline from provided timestamps or events
  const timeline: TimelineEvent[] = events || [
    { status: 'pending', label: 'Order Placed', timestamp: createdAt },
    confirmedAt ? { status: 'confirmed', label: 'Order Confirmed', timestamp: confirmedAt } : null,
    shippedAt ? { status: 'shipped', label: 'Order Shipped', timestamp: shippedAt } : null,
    deliveredAt ? { status: 'delivered', label: 'Order Delivered', timestamp: deliveredAt } : null,
    cancelledAt ? { status: 'cancelled', label: 'Order Cancelled', timestamp: cancelledAt } : null,
  ].filter(Boolean) as TimelineEvent[];

  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  const getStepStatus = (step: OrderStatus, index: number) => {
    if (isCancelled && step !== 'pending') return 'cancelled';
    if (step === currentStatus) return 'current';
    if (index < currentIndex) return 'completed';
    return 'upcoming';
  };

  const getStepColor = (stepStatus: string, step: OrderStatus) => {
    if (stepStatus === 'cancelled') return 'text-gray-400';
    if (stepStatus === 'completed') return 'text-green-600';
    if (stepStatus === 'current') return defaultSteps[step].color;
    return 'text-gray-300';
  };

  const getLineColor = (index: number) => {
    if (isCancelled) return 'bg-gray-300';
    if (index < currentIndex) return 'bg-green-600';
    return 'bg-gray-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Timeline
        </CardTitle>
        <CardDescription>Track your order progress</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual Timeline */}
        <div className="space-y-6">
          {isCancelled ? (
            // Cancelled order display
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-600">Order Cancelled</h3>
                {cancelledAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(cancelledAt), 'PPP p')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Normal timeline
            statusOrder.map((step, index) => {
              const stepStatus = getStepStatus(step, index);
              const StepIcon = defaultSteps[step].icon;
              const timelineEvent = timeline.find(e => e.status === step);
              const isLast = index === statusOrder.length - 1;

              return (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'rounded-full p-3 transition-colors',
                        stepStatus === 'completed' && 'bg-green-100',
                        stepStatus === 'current' && 'bg-blue-100',
                        stepStatus === 'upcoming' && 'bg-gray-100'
                      )}
                    >
                      <StepIcon
                        className={cn('h-6 w-6 transition-colors', getStepColor(stepStatus, step))}
                      />
                    </div>
                    {!isLast && (
                      <div className={cn('w-0.5 h-16 mt-2 transition-colors', getLineColor(index))} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2">
                      <h3 className={cn('font-semibold', stepStatus === 'upcoming' && 'text-muted-foreground')}>
                        {defaultSteps[step].label}
                      </h3>
                      {stepStatus === 'current' && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                      {stepStatus === 'completed' && (
                        <Badge variant="default" className="text-xs bg-green-600">Completed</Badge>
                      )}
                    </div>
                    {timelineEvent?.timestamp && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(timelineEvent.timestamp), 'PPP p')}
                      </p>
                    )}
                    {timelineEvent?.description && (
                      <p className="text-sm text-muted-foreground mt-2">{timelineEvent.description}</p>
                    )}
                    {stepStatus === 'upcoming' && (
                      <p className="text-sm text-muted-foreground mt-1 italic">Pending</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Event History */}
        {timeline.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-semibold mb-4">Order History</h4>
            <div className="space-y-3">
              {timeline.slice().reverse().map((event, index) => {
                const Icon = defaultSteps[event.status].icon;
                return (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <Icon className={cn('h-4 w-4 mt-0.5', defaultSteps[event.status].color)} />
                    <div className="flex-1">
                      <p className="font-medium">{event.label}</p>
                      {event.timestamp && (
                        <p className="text-muted-foreground">
                          {format(new Date(event.timestamp), 'PPP p')}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
