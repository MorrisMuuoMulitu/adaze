import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center bg-muted/20 border border-dashed border-border/60 rounded-none ${className}`}
    >
      {Icon && (
        <div className="mb-6 p-4 bg-muted/30 rounded-full">
          <Icon className="w-10 h-10 text-muted-foreground/60" />
        </div>
      )}
      
      <h3 className="text-xl font-black uppercase tracking-tighter mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-8 font-mono uppercase tracking-tight opacity-70">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          className="btn-premium h-12 px-8 rounded-none text-[10px] font-black tracking-widest uppercase"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
