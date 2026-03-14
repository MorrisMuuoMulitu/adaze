import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function OrderSkeleton() {
  return (
    <Card className="rounded-none border-border/50 bg-muted/5 mb-4 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 rounded-none bg-muted-foreground/10" />
              <Skeleton className="h-4 w-32 rounded-none bg-muted-foreground/10" />
            </div>
            <Skeleton className="h-8 w-64 rounded-none bg-muted-foreground/10" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-none bg-muted-foreground/10" />
              <Skeleton className="h-5 w-24 rounded-none bg-muted-foreground/10" />
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 justify-center">
            <Skeleton className="h-10 w-32 rounded-none bg-muted-foreground/10" />
            <Skeleton className="h-4 w-24 rounded-none bg-muted-foreground/10" />
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border/50 flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton className="h-12 w-12 rounded-none bg-muted-foreground/10" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-none bg-muted-foreground/10" />
                <Skeleton className="h-3 w-12 rounded-none bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
