import { Skeleton } from "../../ui/skeleton";

export default function HealthCheckPackageCardSkeleton() {
  return (
    <div className="w-full min-h-104 rounded-2xl overflow-hidden relative bg-gray-100">
      {/* Image / gradient placeholder */}
      <Skeleton className="absolute inset-0 rounded-2xl" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
        {/* Title */}
        <div className="absolute bottom-6 space-y-2">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-6 w-1/2 rounded" />
        </div>

        {/* Description */}
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />

          {/* Button */}
          <Skeleton className="h-10 w-7/12 rounded mt-2" />
        </div>
      </div>
    </div>
  );
}
