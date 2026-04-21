import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function MenuSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map(section => (
        <div key={section}>
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-3 w-40 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(item => (
              <Card key={item} className="overflow-hidden">
                <Skeleton className="w-full h-36" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-9 w-[68px] rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
