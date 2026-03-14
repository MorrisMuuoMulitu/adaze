"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Eye, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewCountProps {
  productId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ViewCount({ productId }: ViewCountProps) {
  const { data, error } = useSWR(`/api/products/${productId}/view`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Track view on mount
  useEffect(() => {
    fetch(`/api/products/${productId}/view`, { method: "POST" });
  }, [productId]);

  if (!data || data.recentViews < 2) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 border border-accent/20 rounded-none w-fit"
    >
      <Users className="h-3.5 w-3.5 text-accent animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-widest text-accent">
        {data.recentViews} People viewing now
      </span>
    </motion.div>
  );
}
