"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
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
  MessageCircle
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
import { getCartItems } from '@/lib/cart';
import Link from 'next/link'; // Import Link

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'trader' | 'transporter';
  avatar?: string;
  location: string;
  isVerified: boolean;
  wallet: {
    balance: number;
    currency: string;
  };
}

interface NavbarProps {
  onAuthClick: (type: 'login' | 'register') => void;
  user?: User | null;
  onLogout: () => void;
}

export function SiteHeader({ onAuthClick, user, onLogout }: NavbarProps) {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    setCartItemCount(getCartItems().length);
  }, []);

  const navItems = [
    { name: t('nav.marketplace'), href: '/marketplace', icon: ShoppingBag },
    { name: t('nav.how_it_works'), href: '#how-it-works', icon: null },
    { name: t('nav.about'), href: '/about', icon: null },
    { name: t('nav.contact'), href: '/contact', icon: null },
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
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="african-gradient w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ADAZE
            </span>
          </motion.div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, traders, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    toast({
                      title: "Coming Soon!",
                      description: "Search functionality is under development.",
                    });
                  }
                }}
                className="pl-10 pr-4 bg-muted/50 border-0 focus:bg-background transition-colors h-10 focus-ring"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
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
                {/* Quick Actions */}
                <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button">
                  <Heart className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
                </Button>
                
                <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">{cartItemCount}</Badge>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">5</Badge>
                </Button>

                <Button variant="ghost" size="sm" className="w-9 h-9 p-0 mobile-button">
                  <MessageCircle className="h-4 w-4" />
                </Button>

                {/* Wallet Balance */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-lg">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {user.wallet.currency} {user.wallet.balance.toLocaleString()}
                  </span>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full mobile-button">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className={getRoleColor(user.role)}>
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium leading-none truncate">
                            {user.name}
                          </p>
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{user.location}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast({
                      title: "Coming Soon!",
                      description: "The Profile page is under development.",
                    })}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={onLogout}>
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
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">5</Badge>
                </Button>
                
                <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 mobile-button" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">{cartItemCount}</Badge>
                  </Link>
                </Button>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        toast({
                          title: "Coming Soon!",
                          description: "Search functionality is under development.",
                        });
                      }
                    }}
                    className="pl-10 pr-4 h-12 focus-ring"
                  />
                </div>

                {navItems.map((item) => (
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
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className={getRoleColor(user.role)}>
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-lg">
                      <Wallet className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium">
                        {user.wallet.currency} {user.wallet.balance.toLocaleString()}
                      </span>
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