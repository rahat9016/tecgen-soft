import { Skeleton } from "@/src/components/ui/skeleton";
import WhatYouGetSkeleton from "./WhatYouGetSkeleton";

export default function HealthCheckContentSkeleton() {
  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="mt-6">
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Title + Select */}
      <div className="my-5 mt-7 lg:my-10 flex flex-col-reverse md:flex-row md:justify-between gap-5 lg:gap-0">
        {/* Title & Price */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-7 w-32" />
        </div>

        {/* Select */}
        <div className="flex">
          <div className="flex lg:flex-col items-center lg:items-start gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-55" />
          </div>
        </div>
      </div>

      {/* What You Get */}
      <WhatYouGetSkeleton />

      {/* Hotline */}
      <div className="mt-6 lg:mt-8 flex items-center gap-3">
        <Skeleton className="h-6 w-[420px]" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Back button */}
      <Skeleton className="h-11 w-56 mt-5 lg:mt-10 mb-10 lg:mb-20" />
    </div>
  );
}
