"use client";

import useSWR from "swr";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

interface RecentPurchasesProps {
  productId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RecentPurchases({ productId }: RecentPurchasesProps) {
  const { data } = useSWR(`/api/products/${productId}/view`, fetcher);

  if (!data || data.recentPurchases === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 bg-muted/5 border border-border/50 rounded-none"
    >
      <div className="p-2 bg-green-500/10 rounded-full">
        <ShoppingBag className="h-4 w-4 text-green-500" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">
          High Demand
        </p>
        <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
          {data.recentPurchases} {data.recentPurchases === 1 ? 'person' : 'people'} bought this in the last 24h
        </p>
      </div>
    </motion.div>
  );
}
