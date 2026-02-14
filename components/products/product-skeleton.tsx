export function ProductSkeleton() {
    return (
        <div className="bg-background border border-border/50 overflow-hidden">
            <div className="relative aspect-[3/4] bg-muted animate-pulse">
                <div className="absolute top-4 left-4">
                    <div className="h-4 w-16 bg-muted-foreground/10" />
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <div className="h-3 w-1/4 bg-muted animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse" />
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                    <div className="h-6 w-1/3 bg-muted animate-pulse" />
                    <div className="h-3 w-1/4 bg-muted animate-pulse" />
                </div>
            </div>
        </div>
    );
}
