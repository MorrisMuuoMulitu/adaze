'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { notificationService, Notification } from '@/lib/notificationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell,
  Check,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Info,
  Package,
  Mail,
  MailOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NotificationBellProps {
  showCount?: boolean;
}

export default function NotificationBell({ showCount = true }: NotificationBellProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up polling to refresh notifications periodically
      const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const allNotifications = await notificationService.getAllNotifications(user.id);
      setNotifications(allNotifications);
      
      const unread = await notificationService.getUnreadNotifications(user.id);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id || '');
      await fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && showCount && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-4">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      disabled={notification.is_read}
                    >
                      {notification.is_read ? (
                        <MailOpen className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Mail className="h-4 w-4 text-blue-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => {
                router.push('/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}