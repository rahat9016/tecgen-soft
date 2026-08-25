import { Skeleton } from "@/src/components/ui/skeleton";

export default function GeneralMembershipFormSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="h-6 w-56" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6 mt-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="h-6 w-44" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6 mt-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Skeleton className="w-24 h-11 rounded-md" />
        <Skeleton className="w-36 h-11 rounded-md" />
      </div>
    </div>
  );
}
