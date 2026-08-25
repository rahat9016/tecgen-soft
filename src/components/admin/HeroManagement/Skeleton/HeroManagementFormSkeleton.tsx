"use client";

import { Skeleton } from "@/src/components/ui/skeleton";

export default function HeroManagementFormSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Form Container */}
      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Description */}
        <div className="mt-4">
          <Skeleton className="w-full h-24 rounded-md" />
        </div>

        {/* Images */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-40 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Skeleton className="w-24 h-11 rounded-md" />
        <Skeleton className="w-32 h-11 rounded-md" />
      </div>
    </div>
  );
}
