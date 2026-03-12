"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  category: string;
  status: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function TraderProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Use the updated API that supports traderId and management mode
      const res = await fetch(`/api/products?traderId=${user.id}&management=true&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'TRADER') {
        router.push('/');
        return;
      }
      fetchProducts();
    }
  }, [user, authLoading, router, fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset? This action is irreversible.')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Asset purged from archive');
        fetchProducts();
      } else {
        throw new Error('Deletions failed');
      }
    } catch (error) {
      toast.error('Critical failure during deletion');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onAuthClick={() => { }} />
        <div className="flex-grow flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onAuthClick={() => { }} />

      <main className="container mx-auto px-6 py-24 space-y-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 gap-8">
          <div>
            <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4 -ml-2 text-[9px] font-black tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors"
                onClick={() => router.push('/dashboard/trader')}
            >
                <ArrowLeft className="h-3 w-3 mr-2" /> Back to Console
            </Button>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              Inventory Log
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Assets <span className="text-muted-foreground/30 italic">Archive.</span>
            </h1>
          </div>
          <Button 
            className="btn-premium rounded-none h-14 px-8 text-[10px] font-black tracking-widest uppercase flex items-center gap-3"
            onClick={() => router.push('/dashboard/trader/products/new')}
          >
            List New Asset
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH ARCHIVE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-muted/5 border border-border/50 pl-12 pr-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-accent transition-all"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <Button variant="outline" className="h-14 px-6 rounded-none border-border text-[9px] font-black tracking-widest uppercase flex items-center gap-2">
                <Filter className="h-3 w-3" /> Filter
             </Button>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group border border-border/50 bg-muted/5 hover:bg-background hover:border-accent/50 transition-all duration-500 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
                  {product.imageUrl ? (
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className="bg-background/80 backdrop-blur-md text-foreground rounded-none text-[8px] font-black tracking-widest border-none">
                      {product.status}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                     <div className="flex gap-2 w-full">
                        <Button 
                            className="bg-accent text-white rounded-none flex-1 h-10 text-[8px] font-black tracking-widest uppercase"
                            onClick={() => router.push(`/dashboard/trader/products/edit/${product.id}`)}
                        >
                            Edit
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" className="rounded-none w-10 h-10 p-0 bg-background/80">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none border-border bg-background">
                                <DropdownMenuItem className="text-[9px] font-black tracking-widest uppercase cursor-pointer" onClick={() => window.open(`/products/${product.id}`, '_blank')}>
                                    <ExternalLink className="h-3 w-3 mr-2" /> View Public
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem className="text-[9px] font-black tracking-widest uppercase text-destructive cursor-pointer" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] font-black tracking-widest text-accent uppercase mb-2">{product.category}</div>
                    <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1 mb-1">{product.name}</h3>
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                       Inventory: {product.stockQuantity} Units
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/30 flex justify-between items-end">
                    <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase underline decoration-accent/30 underline-offset-4">Value</div>
                    <div className="text-lg font-black tracking-tighter">KSH {Number(product.price).toLocaleString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredProducts.length === 0 && !loading && (
            <div className="col-span-full py-32 text-center border border-dashed border-border/50">
               <Package className="h-12 w-12 mx-auto mb-6 text-muted-foreground/20" />
               <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">No search results detected in archive.</h3>
               <Button variant="link" className="mt-4 text-[10px] font-black tracking-widest uppercase text-accent" onClick={() => setSearchQuery('')}>Clear Encryption</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
