"use client";

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

export function RealtimeNotifications() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('realtime-products')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'products',
                    filter: 'status=eq.active',
                },
                (payload) => {
                    console.log('New product received:', payload);
                    const newProduct = payload.new as any;

                    toast('New Drop Alert!', {
                        description: `${newProduct.name} is now available for KSh ${newProduct.price.toLocaleString()}`,
                        icon: <ShoppingBag className="h-5 w-5 text-orange-500" />,
                        action: {
                            label: 'View',
                            onClick: () => router.push(`/products/${newProduct.id}`),
                        },
                        duration: 8000,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router, supabase]);

    return null;
}
