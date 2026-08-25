import { Skeleton } from "../../ui/skeleton";

export default function BlogCardSkeleton() {
  return (
    <div>
      <div className="rounded-xl overflow-hidden">
        <Skeleton className="h-60 w-full" />
        <div className="p-6 h-56 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-11 w-40 mt-5" />
        </div>
      </div>
    </div>
  );
}
