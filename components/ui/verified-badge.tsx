import { ShieldCheck } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VerifiedBadge({ className = "", size = "md" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center justify-center bg-accent text-white rounded-none p-0.5 ${className}`}>
            <ShieldCheck className={sizeClasses[size]} strokeWidth={3} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white border-accent/30 rounded-none text-[10px] font-black uppercase tracking-widest">
          Verified Trader
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
