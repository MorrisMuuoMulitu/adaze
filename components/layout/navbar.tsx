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
  Heart,
  Globe,
  ShoppingBag
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  const navItems = [
    { name: 'ARCHIVE', href: '/marketplace' },
    { name: 'HERITAGE', href: '/marketplace?category=HERITAGE' },
    { name: 'COLLECTIVE', href: '/collective' },
  ];

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-6 md:p-10 pointer-events-none"
    >
      <div 
        className={`w-full max-w-[1400px] flex justify-between items-center px-8 md:px-12 py-5 transition-all duration-1000 pointer-events-auto ${
          isScrolled 
            ? 'glass-morphism rounded-full scale-[0.98] md:scale-100' 
            : 'bg-transparent border-b border-white/5'
        }`}
      >
        {/* Radical Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-accent flex items-center justify-center transition-transform duration-700 group-hover:rotate-[360deg]">
            <span className="text-black font-black text-[10px]">A</span>
          </div>
          <span className="text-sm font-black tracking-[0.4em] uppercase text-white group-hover:text-accent transition-colors">
            ADAZE
          </span>
        </Link>

        {/* Global Hub Navigation */}
        <div className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40 hover:text-accent transition-all duration-500 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-accent transition-all duration-500 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Action Node */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 pr-6 border-r border-white/10">
            <Link href="/wishlist" className="relative group p-2">
              <Heart className="h-4 w-4 text-white/30 group-hover:text-accent transition-colors" />
              {wishlistItemCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full text-[7px] font-black flex items-center justify-center text-black border border-black animate-pulse">
                  {wishlistItemCount}
                </span>
              )}
            </Link>
            <div className="p-2 opacity-50 hover:opacity-100 transition-opacity">
               <CartSidebar cartCount={cartItemCount} onCartUpdate={setCartItemCount} />
            </div>
          </div>

          {!user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => onAuthClick('login')}
                className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors"
              >
                Access
              </button>
              <Button 
                onClick={() => onAuthClick('register')}
                className="h-10 px-8 rounded-full btn-luxury text-[9px]"
              >
                Sync Identity
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1 rounded-full border border-white/5 bg-white/5 hover:border-accent/40 transition-all group">
                  <Avatar className="h-8 w-8 rounded-full border border-white/5">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-accent text-black text-[9px] font-black">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-[9px] font-black tracking-[0.1em] uppercase text-white/60 group-hover:text-white px-2">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-morphism rounded-3xl p-3 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <DropdownMenuItem asChild className="rounded-2xl py-4 hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                  <Link href={`/dashboard/${user.role?.toLowerCase()}`} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                      <LayoutDashboard className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Intelligence Hub</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-2xl py-4 text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer" onClick={handleLogout}>
                   <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <LogOut className="h-4 w-4" />
                   </div>
                   <span className="text-[10px] font-black tracking-[0.2em] uppercase">Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Terminal */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 text-white/40 hover:text-white transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Fullscreen Neural Link (Mobile Menu) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col pointer-events-auto p-10 pt-40"
          >
            <div className="absolute top-10 right-10 flex items-center gap-4 border border-white/10 rounded-full py-2 px-6">
               <span className="text-[9px] font-black text-white/20 tracking-[0.5em] uppercase">Terminal Active</span>
               <button onClick={() => setIsMenuOpen(false)} className="text-white">
                 <X className="h-8 w-8" />
               </button>
            </div>
            
            <div className="flex flex-col gap-10">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                >
                  <Link
                    href={item.href}
                    className="text-6xl font-black tracking-tighter text-white/20 hover:text-accent uppercase transition-all flex items-center gap-6 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl font-mono text-accent/20 group-hover:text-accent">0{i+1}</span>
                    <span className="group-hover:translate-x-4 transition-transform text-outline hover:text-fill">{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}