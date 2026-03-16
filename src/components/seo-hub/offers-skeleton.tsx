import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OffersSkeleton() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Cards Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5 pb-0">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              
              {/* Terms */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
              
              {/* Decision time */}
              <Skeleton className="h-5 w-32 mb-4" />
              
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              
              {/* Icons */}
              <div className="flex gap-3 mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
            
            <CardFooter className="p-5 pt-0 gap-2">
              <Skeleton className="h-11 flex-1 rounded-lg" />
              <Skeleton className="h-11 w-28 rounded-lg" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
