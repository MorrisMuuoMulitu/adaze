"use client"

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  TrendingUp, 
  Users, 
  Package,
  Truck,
  Wallet,
  Bell,
  MessageCircle,
  Settings
} from 'lucide-react';
import { User, Product } from '@/types';
import { getCartItems } from '@/lib/cart';

interface UserDashboardProps {
  user: User;
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function UserDashboard({ user, products, loading, error }: UserDashboardProps) {
  const cartItems = getCartItems();
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const stats = [
    {
      title: 'Cart Items',
      value: cartItems.length,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Wishlist',
      value: 8,
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20'
    },
    {
      title: 'Wallet Balance',
      value: user.wallet.balance,
      icon: Wallet,
      color: 'text-green-500',
      format: (val: number) => `${user.wallet.currency} ${val.toLocaleString()}`,
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Orders',
      value: 12,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  const quickActions = [
    {
      title: 'Continue Shopping',
      description: 'Browse more products',
      icon: ShoppingBag,
      href: '/products',
      color: 'text-blue-500'
    },
    {
      title: 'Track Orders',
      description: 'Check order status',
      icon: Truck,
      href: '/orders',
      color: 'text-orange-500'
    },
    {
      title: 'Messages',
      description: 'Chat with traders',
      icon: MessageCircle,
      href: '/messages',
      color: 'text-green-500'
    },
    {
      title: 'Notifications',
      description: 'View all alerts',
      icon: Bell,
      href: '/notifications',
      color: 'text-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-foreground"
              >
                Welcome back, {user.name}!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground mt-2"
              >
                Here&apos;s what&apos;s happening with your account today.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge variant="secondary" className="text-sm">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">
                        {stat.format ? stat.format(stat.value) : stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors`}>
                      <action.icon className={`h-6 w-6 ${action.color} group-hover:text-primary transition-colors`} />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity & Featured Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Added to cart', item: 'Nike Air Max', time: '2 hours ago' },
                  { action: 'Liked', item: 'Adidas Ultraboost', time: '5 hours ago' },
                  { action: 'Purchased', item: 'Puma RS-X', time: '1 day ago' },
                  { action: 'Reviewed', item: 'Converse Chuck Taylor', time: '2 days ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                      {activity.action} <span className="text-primary">{activity.item}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Your account statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total spent</span>
                  <span className="font-medium">KSh 12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Items purchased</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">4.8/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
