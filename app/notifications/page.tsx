"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { notificationService, Notification } from '@/lib/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Check, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Info, 
  Package, 
  Mail,
  MailOpen,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    fetchNotifications();
  }, [user, router, activeTab]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let fetchedNotifications: Notification[] = [];
      
      if (activeTab === 'unread') {
        fetchedNotifications = await notificationService.getUnreadNotifications(user.id);
      } else {
        fetchedNotifications = await notificationService.getAllNotifications(user.id);
      }
      
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await fetchNotifications(); // Refresh notifications
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id || '');
      await fetchNotifications(); // Refresh notifications
      toast.success('All notifications marked as read');
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading notifications...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to view notifications.</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notifications
              </h1>
              <p className="text-muted-foreground">Stay updated with your order status</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={markAllAsRead} disabled={notifications.length === 0 || activeTab === 'unread'}>
                Mark All as Read
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Notifications
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'unread'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({notifications.filter(n => !n.is_read).length})
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No notifications</h3>
              <p className="text-muted-foreground mt-2">
                {activeTab === 'unread' 
                  ? 'You have no unread notifications.' 
                  : 'You have not received any notifications yet.'}
              </p>
              <Button className="mt-4" onClick={() => router.push('/marketplace')}>
                Browse Orders
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`overflow-hidden ${
                    !notification.is_read ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{notification.title}</CardTitle>
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-left">
                            {notification.message}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge className={getNotificationBadgeVariant(notification.type)}>
                          {notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        disabled={notification.is_read}
                      >
                        {notification.is_read ? (
                          <>
                            <MailOpen className="h-4 w-4 mr-2" />
                            Read
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Mark as Read
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}