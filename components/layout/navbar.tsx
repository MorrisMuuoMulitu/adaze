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
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const supabase = createClient();

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch counts when user logs in or on component mount
  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        try {
          const cartCount = await cartService.getCartCount(user.id);
          setCartItemCount(cartCount);

          const wishlistCount = await wishlistService.getWishlistCount(user.id);
          setWishlistItemCount(wishlistCount);

          const unreadNotifications = (await notificationService.getUnreadNotifications(user.id)).length;
          setNotificationCount(unreadNotifications);
        } catch (error) {
          console.error('Error fetching counts:', error);
        }
      };

      fetchCounts();

      const handleCartUpdate = async () => {
        try {
          const count = await cartService.getCartCount(user.id);
          setCartItemCount(count);
        } catch (error) {
          console.error('Error updating cart count:', error);
        }
      };
      window.addEventListener('cartUpdated', handleCartUpdate);

      const handleWishlistUpdate = async () => {
        try {
          const count = await wishlistService.getWishlistCount(user.id);
          setWishlistItemCount(count);
        } catch (error) {
          console.error('Error updating wishlist count:', error);
        }
      };
      window.addEventListener('wishlistUpdated', handleWishlistUpdate);

      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
        window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      };
    } else {
      setCartItemCount(0);
      setWishlistItemCount(0);
      setNotificationCount(0);
    }

    const handleAuthTrigger = (event: Event) => {
      const customEvent = event as CustomEvent;
      const type = customEvent.detail?.type || 'login';
      onAuthClick(type);
    };
    window.addEventListener('TRIGGER_AUTH_MODAL', handleAuthTrigger);

    return () => {
      window.removeEventListener('TRIGGER_AUTH_MODAL', handleAuthTrigger);
    };
  }, [user, onAuthClick]);

  const handleLogout = async () => {
    try {
      if (user?.id) {
        const { terminateSession } = await import('@/lib/login-tracker');
        await terminateSession(user.id);
      }
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      window.location.href = '/';
    }
  };

  const userRole = profile?.role || user?.user_metadata.role || 'buyer';
  const userName = profile?.full_name || user?.user_metadata.full_name || 'User';
  const isVerified = !!user?.email_confirmed_at;

  const navItems = [
    { name: t('nav.marketplace'), href: '/marketplace', icon: ShoppingBag },
    { name: t('nav.how_it_works'), href: '#how-it-works', icon: null },
  ];

  const traderNavItems = [
    { name: 'DASHBOARD', href: '/dashboard/trader', icon: LayoutDashboard },
    { name: 'PRODUCTS', href: '/products/manage', icon: Package },
    { name: 'ORDERS', href: '/orders/received', icon: ClipboardList },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-b py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span className="text-2xl font-black tracking-tighter">ADAZE</span>
              <span className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            </div>
          </Link>

          {/* Center Navigation - Fashion Minimalist */}
          <div className="hidden lg:flex items-center gap-8">
            {(userRole === 'trader' ? traderNavItems : navItems).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] font-black tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/search:text-accent transition-colors" />
              <Input
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-48 focus:w-64 bg-muted/30 border-none transition-all duration-500 rounded-none text-[10px] font-black tracking-widest"
              />
            </div>

            <div className="h-6 w-[1px] bg-border mx-2"></div>

            {user ? (
              <div className="flex items-center gap-2">
                {userRole === 'buyer' && (
                  <>
                    <Link href="/wishlist" className="relative p-2 hover:bg-muted transition-colors group">
                      <Heart className="h-5 w-5 " />
                      {wishlistItemCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                      )}
                    </Link>
                    <CartSidebar
                      cartCount={cartItemCount}
                      onCartUpdate={setCartItemCount}
                    />
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity">
                      <div className="text-right hidden xl:block">
                        <div className="text-[10px] font-black tracking-widest uppercase">{userName}</div>
                        <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">{userRole}</div>
                      </div>
                      <Avatar className="h-8 w-8 rounded-none border border-border">
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback className="rounded-none bg-primary text-primary-foreground text-[10px] font-bold">
                          {userName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-none border-2 border-border p-2">
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground py-3">
                      <Link href={`/dashboard/${userRole}`} className="flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground py-3">
                      <Link href="/profile" className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {userRole === 'buyer' && (
                      <>
                        <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground py-3">
                          <Link href="/become-trader" className="flex items-center gap-3">
                            <Store className="h-4 w-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-accent">Become a Trader</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground py-3">
                          <Link href="/transporter-registration" className="flex items-center gap-3">
                            <Truck className="h-4 w-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-accent">Join Transporters</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-white py-3" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onAuthClick('login')}
                  className="text-[10px] font-black tracking-widest uppercase hover:bg-muted"
                >
                  Login
                </Button>
                <Button
                  onClick={() => onAuthClick('register')}
                  className="btn-premium rounded-none h-10 px-6 text-[10px] font-black tracking-widest uppercase"
                >
                  Join Adaze
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            {userRole === 'buyer' && (
              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-muted transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* This div was incorrectly closed, it should be part of the main nav structure */}

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background/95 backdrop-blur-xl"
          >
            <div className="container px-6 py-8 flex flex-col gap-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="SEARCH..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-muted/30 border-none rounded-none text-[10px] font-black tracking-widest"
                />
              </div>

              <div className="flex flex-col gap-4">
                {(userRole === 'trader' ? traderNavItems : navItems).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-[12px] font-black tracking-[0.2em] uppercase py-2 border-b border-border/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {user ? (
                <div className="flex flex-col gap-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 rounded-none">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold">
                        {userName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest">{userName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">{userRole}</div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="rounded-none h-12 text-[10px] font-black tracking-widest uppercase"
                  >
                    Log Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAuthClick('login');
                      setIsMenuOpen(false);
                    }}
                    className="h-14 rounded-none text-[10px] font-black tracking-widest uppercase"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      onAuthClick('register');
                      setIsMenuOpen(false);
                    }}
                    className="btn-premium h-14 rounded-none text-[10px] font-black tracking-widest uppercase"
                  >
                    Join Adaze
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}