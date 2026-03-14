import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="p-4 flex gap-4 items-start border-b border-border/50 animate-pulse">
      <Skeleton className="h-10 w-10 shrink-0 rounded-none bg-muted-foreground/10" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-4 w-1/3 rounded-none bg-muted-foreground/10" />
          <Skeleton className="h-3 w-16 rounded-none bg-muted-foreground/10" />
        </div>
        <Skeleton className="h-3 w-full rounded-none bg-muted-foreground/10" />
        <Skeleton className="h-3 w-2/3 rounded-none bg-muted-foreground/10" />
      </div>
    </div>
  );
}
