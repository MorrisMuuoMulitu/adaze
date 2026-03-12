"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PRODUCT_CATEGORIES } from '@/lib/categories';
import { ArrowLeft, Plus, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';

const productSchema = z.object({
  name: z.string().min(1, { message: "Asset name is required" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Value must be positive" }),
  category: z.string().min(1, { message: "Classification required" }),
  image_url: z.string().url({ message: "Valid URL required" }).optional().or(z.literal("")),
  stock_quantity: z.coerce.number().int().min(0, { message: "Inventory count must be positive" }),
});

export default function NewProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      image_url: "",
      stock_quantity: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traderId: user.id,
          name: values.name,
          description: values.description,
          price: values.price,
          category: values.category,
          imageUrl: values.image_url,
          stockQuantity: values.stock_quantity,
          status: 'ACTIVE'
        }),
      });

      if (res.ok) {
        toast.success("New asset listed successfully");
        router.push('/dashboard/trader/products');
      } else {
        throw new Error('Listing failed');
      }
    } catch (error: any) {
      toast.error("Critical failure during listing", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar onAuthClick={() => { }} />

      <main className="container mx-auto px-6 py-24 max-w-4xl">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 mb-12 gap-8">
          <div>
            <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4 -ml-2 text-[9px] font-black tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors"
                onClick={() => router.push('/dashboard/trader/products')}
            >
                <ArrowLeft className="h-3 w-3 mr-2" /> Discard Manifest
            </Button>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              Creation Suite
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              New <span className="text-muted-foreground/30 italic">Asset.</span>
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black tracking-widest uppercase opacity-50">Asset Denomination</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VINTAGE OVERCOAT" {...field} className="h-16 rounded-none border-border/50 bg-muted/5 font-mono text-sm tracking-widest uppercase focus:border-accent transition-all" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase tracking-widest" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black tracking-widest uppercase opacity-50">Manifest Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="DETAILED PRODUCT SPECIFICATIONS..." {...field} className="min-h-[150px] rounded-none border-border/50 bg-muted/5 font-mono text-sm tracking-widest uppercase focus:border-accent transition-all leading-relaxed" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase tracking-widest" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black tracking-widest uppercase opacity-50">Market Value (KSH)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="h-16 rounded-none border-border/50 bg-muted/5 font-mono text-sm tracking-widest focus:border-accent transition-all" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase tracking-widest" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock_quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black tracking-widest uppercase opacity-50">Inventory Units</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="h-16 rounded-none border-border/50 bg-muted/5 font-mono text-sm tracking-widest focus:border-accent transition-all" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase tracking-widest" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black tracking-widest uppercase opacity-50">Asset Classification</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-16 rounded-none border-border/50 bg-muted/5 text-[11px] font-black tracking-[0.2em] uppercase focus:border-accent transition-all">
                                                    <SelectValue placeholder="SELECT CATEGORY" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-none border-border bg-background">
                                                {PRODUCT_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value} className="text-[10px] font-black tracking-widest uppercase">
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold uppercase tracking-widest" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black tracking-widest uppercase opacity-50">Visual Asset URL</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="HTTPS://IMAGES.UNSPLASH.COM/..." {...field} className="h-16 rounded-none border-border/50 bg-muted/5 font-mono text-xs tracking-widest uppercase focus:border-accent transition-all pl-12" />
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-[9px] font-medium uppercase tracking-[0.2em] opacity-40">High-resolution cinematic imagery recommended.</FormDescription>
                                        <FormMessage className="text-[10px] font-bold uppercase tracking-widest" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full h-16 btn-premium rounded-none text-[10px] font-black tracking-[0.4em] uppercase flex items-center justify-center gap-4"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Initialize Listing
                                    <Sparkles className="h-4 w-4 text-accent" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <div className="border border-border/50 bg-muted/5 p-8 space-y-6">
                    <div className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">Guidance Protocol</div>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest opacity-60">Listing requires high-fidelity descriptions for archival accuracy.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest opacity-60">Price values must reflect the premium collective market standards.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest opacity-60">Images must be correctly formatted to maintain visual integrity.</p>
                        </div>
                    </div>
                </div>

                <div className="border border-border/50 p-8 flex items-center gap-4 group cursor-help">
                    <div className="w-12 h-12 rounded-none border border-border/50 flex items-center justify-center bg-muted/5 group-hover:border-accent transition-colors">
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black tracking-widest uppercase">Batch Upload</div>
                        <div className="text-[8px] font-bold tracking-widest uppercase opacity-40 mt-1">Available for Whitelist Vanguards</div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
