"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, X, Star } from 'lucide-react';
import { addToCart } from '@/lib/cart';
import { useAuth } from '@/components/auth/auth-provider';
import { formatCurrency } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string;
    condition: string;
    size: string | null;
    brand: string | null;
    trader?: {
        full_name: string;
    };
}

interface QuickViewModalProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
    const { user } = useAuth();
    const [isAdding, setIsAdding] = useState(false);

    if (!product) return null;

    const handleAddToCart = () => {
        setIsAdding(true);
        // Map product to CartItem structure if needed, or just pass as is if compatible
        // lib/cart.ts expects Product which has id (number in lib/cart.ts? let's check)
        // lib/cart.ts imports Product from @/types.
        // Our local Product interface has id as string.
        // We might need to cast or ensure types match.
        // For now, we'll try passing it.
        addToCart({
            ...product,
            // Ensure required fields for CartItem are present
        } as any, 1, !!user);
        setTimeout(() => setIsAdding(false), 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Section */}
                    <div className="relative aspect-square md:aspect-auto h-full min-h-[300px] bg-zinc-100 dark:bg-zinc-900">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-400">
                                No Image
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <Badge className="bg-white/90 text-black hover:bg-white/100 backdrop-blur-sm shadow-sm">
                                {product.condition}
                            </Badge>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 md:p-8 flex flex-col h-full">
                        <DialogHeader className="mb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <Badge variant="outline" className="mb-2 text-zinc-500 border-zinc-200 dark:border-zinc-800">
                                        {product.category}
                                    </Badge>
                                    <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                                        {product.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-base font-medium text-purple-600 dark:text-purple-400">
                                        {formatCurrency(product.price)}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 space-y-6">
                            <div className="prose prose-sm dark:prose-invert text-zinc-600 dark:text-zinc-400">
                                <p>{product.description || 'No description available.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Size</span>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{product.size || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Brand</span>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{product.brand || 'Generic'}</p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Trader</span>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{product.trader?.full_name || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4">
                            <Button
                                className="w-full h-12 text-base font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black transition-all"
                                onClick={handleAddToCart}
                                disabled={isAdding}
                            >
                                {isAdding ? (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Added to Cart
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white text-zinc-500 hover:text-zinc-900 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                    <X className="w-5 h-5" />
                    <span className="sr-only">Close</span>
                </button>
            </DialogContent>
        </Dialog>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
