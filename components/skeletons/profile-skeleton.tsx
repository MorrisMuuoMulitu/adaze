import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="space-y-12">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
        <Skeleton className="h-32 w-32 rounded-none bg-muted-foreground/10" />
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64 rounded-none bg-muted-foreground/10" />
            <Skeleton className="h-6 w-20 rounded-none bg-muted-foreground/10" />
          </div>
          <div className="flex flex-wrap gap-6">
            <Skeleton className="h-5 w-40 rounded-none bg-muted-foreground/10" />
            <Skeleton className="h-5 w-40 rounded-none bg-muted-foreground/10" />
            <Skeleton className="h-5 w-40 rounded-none bg-muted-foreground/10" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-none border-border/50 bg-muted/5">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 rounded-none bg-muted-foreground/10 mb-2" />
              <Skeleton className="h-8 w-12 rounded-none bg-muted-foreground/10" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-border/50 pb-4">
          <Skeleton className="h-8 w-24 rounded-none bg-muted-foreground/10" />
          <Skeleton className="h-8 w-24 rounded-none bg-muted-foreground/10" />
          <Skeleton className="h-8 w-24 rounded-none bg-muted-foreground/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-none bg-muted-foreground/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
