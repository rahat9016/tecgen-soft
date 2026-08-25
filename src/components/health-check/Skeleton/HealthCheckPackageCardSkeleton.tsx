import { Skeleton } from "../../ui/skeleton";

export default function HealthCheckPackageCardSkeleton() {
  return (
    <div className="w-full min-h-104 rounded-2xl overflow-hidden relative bg-gray-100">
      <Skeleton className="absolute inset-0 w-full h-full" />
      <div className="absolute -top-20 -left-[30%]">
        <Skeleton className="w-48 h-48 rounded-full blur-md" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-10 w-7/12 rounded-lg" />
      </div>
    </div>
  );
}
