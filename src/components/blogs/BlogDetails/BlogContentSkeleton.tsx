import { Skeleton } from "../../ui/skeleton";

export default function BlogContentSkeleton() {
  return (
    <div className="mt-6 container">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-40 mb-4" />

      {/* Back button + share */}
      <div className="flex items-center justify-between gap-1">
        <Skeleton className="h-11 w-36 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Title + date */}
      <div className="mt-6 lg:mt-10">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* Image */}
      <Skeleton className="w-full h-56 lg:h-105 xl:h-120 rounded-lg mt-5 lg:mt-10 mb-6" />

      {/* Content */}
      <div className="space-y-3 mb-8 lg:mb-16 xl:mb-25">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
      </div>
    </div>
  );
}
