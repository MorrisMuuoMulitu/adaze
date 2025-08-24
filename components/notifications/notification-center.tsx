"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  X, 
  Package, 
  DollarSign, 
  Star, 
  MessageCircle, 
  Truck,
  ShoppingBag,
  AlertCircle,
  Check,
  Trash2
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: 'buyer' | 'trader' | 'transporter';
}

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'review' | 'message' | 'delivery' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  user: User;
}

export function NotificationCenter({ user }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate notifications based on user role
  useEffect(() => {
    const generateNotifications = (): Notification[] => {
      const baseNotifications: Notification[] = [
        {
          id: '1',
          type: 'system',
          title: 'Welcome to ADAZE!',
          message: 'Your account has been successfully created. Start exploring our marketplace!',
          timestamp: new Date(Date.now() - 300000),
          read: false,
          priority: 'medium'
        }
      ];

      if (user.role === 'buyer') {
        return [
          ...baseNotifications,
          {
            id: '2',
            type: 'order',
            title: 'Order Confirmed',
            message: 'Your order #AD12345 has been confirmed by the trader. Expected delivery: Tomorrow',
            timestamp: new Date(Date.now() - 120000),
            read: false,
            actionUrl: '/orders/AD12345',
            priority: 'high'
          },
          {
            id: '3',
            type: 'delivery',
            title: 'Out for Delivery',
            message: 'Your package is out for delivery. Track your order for real-time updates.',
            timestamp: new Date(Date.now() - 60000),
            read: false,
            actionUrl: '/track/AD12345',
            priority: 'high'
          },
          {
            id: '4',
            type: 'payment',
            title: 'Payment Successful',
            message: 'Payment of KSh 2,500 has been processed successfully.',
            timestamp: new Date(Date.now() - 180000),
            read: true,
            priority: 'medium'
          }
        ];
      } else if (user.role === 'trader') {
        return [
          ...baseNotifications,
          {
            id: '2',
            type: 'order',
            title: 'New Order Received',
            message: 'You have a new order for Vintage Denim Jacket. Please confirm within 2 hours.',
            timestamp: new Date(Date.now() - 90000),
            read: false,
            actionUrl: '/dashboard/orders',
            priority: 'high'
          },
          {
            id: '3',
            type: 'payment',
            title: 'Payment Received',
            message: 'KSh 2,125 has been credited to your wallet for order #AD12345.',
            timestamp: new Date(Date.now() - 150000),
            read: false,
            priority: 'medium'
          },
          {
            id: '4',
            type: 'review',
            title: 'New Review',
            message: 'You received a 5-star review from Sarah K. for your excellent service!',
            timestamp: new Date(Date.now() - 240000),
            read: true,
            priority: 'low'
          }
        ];
      } else {
        return [
          ...baseNotifications,
          {
            id: '2',
            type: 'delivery',
            title: 'New Delivery Job',
            message: 'Delivery job available in your area. Pickup: Nairobi CBD, Delivery: Westlands',
            timestamp: new Date(Date.now() - 45000),
            read: false,
            actionUrl: '/jobs/available',
            priority: 'high'
          },
          {
            id: '3',
            type: 'payment',
            title: 'Delivery Payment',
            message: 'KSh 375 earned for completed delivery #DL789. Great job!',
            timestamp: new Date(Date.now() - 120000),
            read: false,
            priority: 'medium'
          }
        ];
      }
    };

    const userNotifications = generateNotifications();
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.read).length);
  }, [user.role]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'payment': return DollarSign;
      case 'review': return Star;
      case 'message': return MessageCircle;
      case 'delivery': return Truck;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-500';
    if (priority === 'medium') return 'text-orange-500';
    
    switch (type) {
      case 'order': return 'text-blue-500';
      case 'payment': return 'text-green-500';
      case 'review': return 'text-yellow-500';
      case 'message': return 'text-purple-500';
      case 'delivery': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Bell */}
      <motion.div
        className="fixed top-16 right-4 sm:top-20 sm:right-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full relative bg-background/80 backdrop-blur-md border-border/50 mobile-button"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 text-xs bg-red-500 text-white animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-16 right-4 sm:top-20 sm:right-6 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-96 z-40"
          >
            <Card className="h-full flex flex-col border-0 shadow-2xl bg-card/95 backdrop-blur-md">
              {/* Header */}
              <CardHeader className="p-3 sm:p-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Notifications</CardTitle>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs h-8 mobile-button"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 p-0 mobile-button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Notifications List */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 sm:p-4 space-y-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors group hover:bg-muted/50 ${
                              !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'
                            }`}
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.actionUrl) {
                                // Navigate to action URL
                                console.log('Navigate to:', notification.actionUrl);
                              }
                            }}
                          >
                            <div className="flex items-start space-x-2 sm:space-x-3">
                              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                                notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                                notification.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/20' :
                                'bg-muted'
                              }`}>
                                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${getNotificationColor(notification.type, notification.priority)}`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <h4 className={`text-sm font-medium truncate ${
                                    !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatTimestamp(notification.timestamp)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="w-5 h-5 sm:w-6 sm:h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity mobile-button"
                                    >
                                      <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                {!notification.read && (
                                
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Footer */}
              <div className="p-3 sm:p-4 border-t">
                <Button variant="outline" className="w-full text-sm h-10 mobile-button">
                  View All Notifications
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}