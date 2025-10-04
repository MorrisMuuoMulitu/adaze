"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Truck,
  Store,
  Bell,
  Search,
  Heart,
  ShoppingCart,
  Wallet,
  MessageCircle,
  Package,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cartService } from '@/lib/cartService';
import { notificationService } from '@/lib/notificationService'; // Import notificationService
import { wishlistService } from '@/lib/wishlistService'; // Import wishlistService
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { CartSidebar } from './cart-sidebar';

interface NavbarProps {
  onAuthClick: (type: 'login' | 'register') => void;
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0); // New state for wishlist
  const [notificationCount, setNotificationCount] = useState(0); // New state for notifications
  const { t } = useLanguage();
  const { user } = useAuth();
  const supabase = createClient();

  // Fetch counts when user logs in or on component mount
  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        try {
          const cartCount = await cartService.getCartCount(user.id);
          setCartItemCount(cartCount);

          const wishlistCount = await wishlistService.getWishlistCount(user.id); // Fetch actual wishlist count
          setWishlistItemCount(wishlistCount);

          const unreadNotifications = (await notificationService.getUnreadNotifications(user.id)).length;
          setNotificationCount(unreadNotifications);
        } catch (error) {
          console.error('Error fetching counts:', error);
        }
      };

      fetchCounts();

      // Set up listener for cart updates
      const handleCartUpdate = async () => {
        try {
          const count = await cartService.getCartCount(user.id);
          setCartItemCount(count);
        } catch (error) {
          console.error('Error updating cart count:', error);
        }
      };

      window.addEventListener('cartUpdated', handleCartUpdate);

      // Set up listener for wishlist updates (if applicable)
      const handleWishlistUpdate = async () => {
        try {
          const count = await wishlistService.getWishlistCount(user.id);
          setWishlistItemCount(count);
        } catch (error) {
          console.error('Error updating wishlist count:', error);
        }
      };
      window.addEventListener('wishlistUpdated', handleWishlistUpdate);

      // Set up listener for notification updates (if applicable)
      // window.addEventListener('notificationUpdated', handleNotificationUpdate);

      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
        window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
        // window.removeEventListener('notificationUpdated', handleNotificationUpdate);
      };
    } else {
      setCartItemCount(0);
      setWishlistItemCount(0);
      setNotificationCount(0);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      // Terminate active session
      if (user?.id) {
        const { terminateSession } = await import('@/lib/login-tracker');
        await terminateSession(user.id);
      }
      
      await supabase.auth.signOut();
      // Always redirect to landing page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      // Even on error, redirect to landing page
      window.location.href = '/';
    }
  };

  const userRole = user?.user_metadata.role || 'buyer';
  const userName = user?.user_metadata.full_name || 'User';
  const isVerified = !!user?.email_confirmed_at;

  const navItems = [
    { name: t('nav.marketplace'), href: '/marketplace', icon: ShoppingBag },
    { name: t('nav.how_it_works'), href: '#how-it-works', icon: null },
    { name: t('nav.about'), href: '/about', icon: null },
    { name: t('nav.contact'), href: '/contact', icon: null },
  ];

  const traderNavItems = [
    { name: 'Dashboard', href: '/dashboard/trader', icon: LayoutDashboard },
    { name: 'Products', href: '/products/manage', icon: Package },
    { name: 'Orders', href: '/orders/received', icon: ClipboardList },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'trader': return <Store className="h-4 w-4" />;
      case 'transporter': return <Truck className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'trader': return 'bg-green-500';
      case 'transporter': return 'bg-blue-500';
      default: return 'bg-primary';
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" passHref>
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="african-gradient w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ADAZE
              </span>
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, traders, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-muted/50 border-0 focus:bg-background transition-colors h-10 focus-ring"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {(userRole === 'trader' ? traderNavItems : navItems).map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors flex items-center space-x-1 text-sm"
                whileHover={{ y: -2 }}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2">
                  <ThemeToggle />
                  <LanguageToggle />
                  
                  {user ? (
                    <div className="flex items-center space-x-2">
                      {/* Quick Actions - Only show for buyers */}
                      {userRole === 'buyer' && (
                        <>
                          <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button" asChild>
                            <Link href="/wishlist">
                              <Heart className="h-4 w-4" />
                              {wishlistItemCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">{wishlistItemCount}</Badge>
                              )}
                            </Link>
                          </Button>
                          
                          <CartSidebar 
                            cartCount={cartItemCount} 
                            onCartUpdate={setCartItemCount} 
                          />
                        </>
                      )}
                      
                      <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button">
                        <Bell className="h-4 w-4" />
                        {notificationCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">{notificationCount}</Badge>
                        )}
                      </Button>

                      <Button variant="ghost" size="sm" className="w-9 h-9 p-0 mobile-button">
                        <MessageCircle className="h-4 w-4" />
                      </Button>

                      {/* User Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-8 w-8 rounded-full mobile-button">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.user_metadata.avatar_url} alt={userName} />
                              <AvatarFallback className={getRoleColor(userRole)}>
                                {userName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end" forceMount>
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium leading-none truncate">
                                  {userName}
                                </p>
                                {isVerified && (
                                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                                )}
                              </div>
                              <p className="text-xs leading-none text-muted-foreground truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  {getRoleIcon(userRole)}
                                  <span className="capitalize">{userRole}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{user.user_metadata.location}</span>
                              </div>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/${userRole}`}>
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/profile">
                              <User className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          {userRole === 'buyer' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href="/wishlist">
                                  <Heart className="mr-2 h-4 w-4" />
                                  <span>Wishlist</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/orders">
                                  <Package className="mr-2 h-4 w-4" />
                                  <span>My Orders</span>
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href="/settings">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>Wallet</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => onAuthClick('login')}
                        className="mobile-button"
                      >
                        {t('nav.login')}
                      </Button>
                      <Button 
                        onClick={() => onAuthClick('register')}
                        className="african-gradient text-white hover:opacity-90 mobile-button"
                      >
                        {t('nav.get_started')}
                      </Button>
                    </div>
                  )}
                </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-2">
            {user && (
              <>
                <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">{notificationCount}</Badge>
                  )}
                </Button>
                
                {userRole === 'buyer' && (
                  <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button" asChild>
                    <Link href="/cart">
                      <ShoppingCart className="h-4 w-4" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">{cartItemCount}</Badge>
                    </Link>
                  </Button>
                )}
              </>
            )}
            
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 p-0 mobile-button"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t"
            >
              <div className="flex flex-col space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-12 focus-ring"
                  />
                </div>

                {(userRole === 'trader' ? traderNavItems : navItems).map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-foreground/80 hover:text-primary transition-colors px-2 py-3 flex items-center space-x-2 mobile-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </a>
                ))}
                
                {user && (
                  <div className="flex items-center space-x-3 px-2 pt-2 border-t">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata.avatar_url} alt={userName} />
                      <AvatarFallback className={getRoleColor(userRole)}>
                        {userName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 px-2 pt-4 border-t">
                  <LanguageToggle />
                </div>
                
                {!user && (
                  <div className="flex flex-col space-y-3 px-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        onAuthClick('login');
                        setIsMenuOpen(false);
                      }}
                      className="h-12 mobile-button"
                    >
                      {t('nav.login')}
                    </Button>
                    <Button 
                      onClick={() => {
                        onAuthClick('register');
                        setIsMenuOpen(false);
                      }}
                      className="african-gradient text-white hover:opacity-90 h-12 mobile-button"
                    >
                      {t('nav.get_started')}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}