import { Skeleton } from "@/src/components/ui/skeleton";

export default function MembershipPackageFormSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="h-6 w-52" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6 mt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-28 w-full rounded-md" />
          </div>
        </div>
      </div>

      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-md" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="w-28 h-11 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-md" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="w-28 h-11 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Skeleton className="w-24 h-11 rounded-md" />
        <Skeleton className="w-36 h-11 rounded-md" />
      </div>
    </div>
  );
}
