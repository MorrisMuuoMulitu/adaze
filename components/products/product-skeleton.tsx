import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function ProductSkeleton() {
    return (
        <Card className="h-full overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="relative aspect-[4/5] overflow-hidden">
                <Skeleton className="h-full w-full" />
                <div className="absolute top-3 right-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="absolute top-3 left-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </div>

            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full shrink-0 ml-2" />
                </div>
                <Skeleton className="h-7 w-1/3" />
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
        </Card>
    );
}
