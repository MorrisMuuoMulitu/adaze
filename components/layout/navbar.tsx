"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Heart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cartService } from '@/lib/cartService';
import { wishlistService } from '@/lib/wishlistService';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { signOut } from 'next-auth/react';
import { CartSidebar } from './cart-sidebar';

interface NavbarProps {
  onAuthClick: (type: 'login' | 'register') => void;
}

export function Navbar({ onAuthClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        try {
          const cartCount = await cartService.getCartCount(user.id);
          setCartItemCount(cartCount);
          const wishlistCount = await wishlistService.getWishlistCount(user.id);
          setWishlistItemCount(wishlistCount);
        } catch (error) {
          console.error('Error fetching counts:', error);
        }
      };
      fetchCounts();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      window.location.href = '/';
    }
  };

  const userRole = user?.role?.toLowerCase() || 'buyer';
  const userName = user?.name || 'User';

  const navItems = [
    { name: 'ARCHIVE', href: '/marketplace' },
    { name: 'HERITAGE', href: '#how-it-works' },
    { name: 'COLLECTIVE', href: '/collective' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ${
        isScrolled ? 'bg-black/90 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-10">
        <div className="flex justify-between items-center">
          {/* Brand Logo - Radical Minimal */}
          <Link href="/" className="text-xl md:text-2xl font-normal tracking-[0.8em] uppercase text-white hover:text-accent transition-colors">
            ADAZE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-16">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/50 hover:text-white transition-all duration-500 relative group"
              >
                {item.name}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-accent transition-all duration-500 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-10">
            {user ? (
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-6 border-r border-white/10 pr-8">
                  <Link href="/wishlist" className="relative hover:opacity-100 opacity-40 transition-opacity">
                    <Heart className="h-4 w-4 text-white" />
                  </Link>
                  <CartSidebar cartCount={cartItemCount} onCartUpdate={setCartItemCount} />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-4 group">
                      <Avatar className="h-9 w-9 rounded-none border border-white/10 group-hover:border-accent transition-colors">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="rounded-none bg-accent text-white text-[10px] font-bold">
                          {userName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-none border border-white/5 bg-black/95 backdrop-blur-3xl p-3 mt-6">
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-white py-4 cursor-pointer">
                      <Link href={`/dashboard/${userRole}`} className="flex items-center gap-4">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase italic">The Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-white py-4 cursor-pointer">
                      <Link href="/profile" className="flex items-center gap-4">
                        <User className="h-4 w-4" />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase italic">User Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5 mx-2" />
                    <DropdownMenuItem className="text-red-500 focus:bg-red-500 focus:text-white py-4 cursor-pointer" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Terminate Session</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-10">
                <button
                  onClick={() => onAuthClick('login')}
                  className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/50 hover:text-white transition-opacity"
                >
                  ENTRY
                </button>
                <Button
                  onClick={() => onAuthClick('register')}
                  className="h-12 px-12 rounded-none bg-white text-black hover:bg-accent hover:text-white text-[9px] font-bold tracking-[0.4em] uppercase"
                >
                  JOIN THE COLLECTIVE
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-6">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-accent transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Experimental Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black p-10 flex flex-col pt-32"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white">
              <X className="h-10 w-10" />
            </button>
            <div className="flex flex-col gap-12">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-4xl font-normal tracking-[0.3em] text-white hover:text-accent uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}