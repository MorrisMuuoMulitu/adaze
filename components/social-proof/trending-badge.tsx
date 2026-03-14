"use client";

import useSWR from "swr";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface TrendingBadgeProps {
  productId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TrendingBadge({ productId }: TrendingBadgeProps) {
  const { data } = useSWR(`/api/products/${productId}/view`, fetcher);

  // Trending if more than 5 views in 24h
  if (!data || data.recentViews < 5) return null;

  return (
    <div className="absolute top-4 left-4 z-10">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5 px-3 py-1 bg-accent text-white rounded-none shadow-xl"
      >
        <TrendingUp className="h-3 w-3" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Trending</span>
      </motion.div>
    </div>
  );
}
