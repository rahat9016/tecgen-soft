import { Skeleton } from "../ui/skeleton";

export default function SpecialtiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`specialty-skeleton-${index}`}
          className="rounded-2xl border border-light-silver bg-white p-6 space-y-4"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-32 mt-3" />
        </div>
      ))}
    </div>
  );
}
