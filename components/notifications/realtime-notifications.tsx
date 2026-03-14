"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";
import { Bell, ShoppingBag, MessageSquare, Tag } from "lucide-react";

export function RealtimeNotifications() {
  const { notifications } = useNotifications();
  const lastNotificationId = useRef<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      
      // If this is a new notification we haven't seen yet
      if (latest.id !== lastNotificationId.current && !latest.is_read) {
        lastNotificationId.current = latest.id;

        // Determine icon and action based on type
        let Icon = Bell;
        let color = "text-accent";

        switch (latest.type) {
          case 'order_update':
            Icon = ShoppingBag;
            color = "text-green-500";
            break;
          case 'new_message':
            Icon = MessageSquare;
            color = "text-blue-500";
            break;
          case 'price_drop':
            Icon = Tag;
            color = "text-orange-500";
            break;
        }

        toast(latest.title, {
          description: latest.message,
          icon: <Icon className={`h-4 w-4 ${color}`} />,
          duration: 5000,
        });
      }
    }
  }, [notifications]);

  return null; // This component doesn't render anything, just handles side effects
}
