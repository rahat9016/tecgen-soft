import { Skeleton } from "@/src/components/ui/skeleton";

export default function PackageFormSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="mt-6">
          <Skeleton className="w-full h-32 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mt-6">
          <Skeleton className="w-full h-12 rounded-md" />
          <Skeleton className="w-full h-12 rounded-md" />
          <Skeleton className="w-full h-12 rounded-md" />
          <Skeleton className="w-full h-12 rounded-md" />
        </div>
      </div>

      {/* Service List Section */}
      <div className="border border-light-silver rounded-lg p-8 bg-white space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-md" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="w-24 h-11 rounded-md" />
        </div>

        <div className="flex gap-2 mt-6">
          <Skeleton className="flex-1 h-12 rounded-md" />
        </div>

        <ul className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-light px-2 py-3 rounded-lg"
            >
              <Skeleton className="w-40 h-5 rounded-md" />
              <Skeleton className="w-9 h-9 rounded-md" />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Skeleton className="w-24 h-11 rounded-md" />
        <Skeleton className="w-32 h-11 rounded-md" />
      </div>
    </div>
  );
}
