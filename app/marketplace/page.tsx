
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  LayoutGrid, 
  List, 
  ChevronDown,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { products as allProducts } from '@/lib/data';
import { Product } from '@/types';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { getCartItems, removeFromCart, updateCartItemQuantity } from '@/lib/cart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const categories = [...new Set(allProducts.map(p => p.category))];
  const maxPrice = Math.max(...allProducts.map(p => p.price));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(allProducts);
        setFilteredProducts(allProducts);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let tempProducts = products;

    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(p => selectedCategories.includes(p.category));
    }

    tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(tempProducts);
  }, [selectedCategories, priceRange, products]);

  useEffect(() => {
    setIsClient(true);
    setCartItems(getCartItems());

    const handleCartUpdate = () => {
      setCartItems(getCartItems());
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    updateCartItemQuantity(productId, quantity);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Category</h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCategories([])} className="text-xs">Clear all</Button>
                  </div>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <label htmlFor={category}>{category}</label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <Slider 
                    defaultValue={[0, maxPrice]} 
                    max={maxPrice} 
                    step={100} 
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>KSh {priceRange[0]}</span>
                    <span>KSh {priceRange[1]}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Marketplace</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setLayout('grid')} className={layout === 'grid' ? 'bg-muted' : ''}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setLayout('list')} className={layout === 'list' ? 'bg-muted' : ''}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="lg:hidden" onClick={() => setIsFiltersOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Product Grid */}
            <FeaturedProducts products={filteredProducts} loading={loading} error={error} />

          </main>

          {/* Cart */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
                  <ScrollArea className="h-[400px]">
                    {!isClient ? (
                      <p className="text-muted-foreground text-center">Loading cart...</p>
                    ) : cartItems.length === 0 ? (
                      <p className="text-muted-foreground text-center">Your cart is empty</p>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map(item => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <Image src={item.images[0]} alt={item.name} width={64} height={64} className="rounded-md" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">KSh {item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))} className="w-16 h-8" />
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-semibold">KSh {cartTotal.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Shipping</p>
                      <p className="font-semibold">KSh 500</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <p>Total</p>
                      <p>KSh {(cartTotal + 500).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4">Checkout</Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
