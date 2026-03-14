"use client";

import useSWR from "swr";
import { Notification } from "@/lib/notificationService";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotifications() {
  const { data, error, mutate } = useSWR<Notification[]>("/api/notifications", fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds
    revalidateOnFocus: true,
  });

  const unreadCount = data?.filter((n) => !n.is_read).length || 0;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      mutate();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      mutate();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return {
    notifications: data || [],
    isLoading: !error && !data,
    isError: error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    mutate,
  };
}
