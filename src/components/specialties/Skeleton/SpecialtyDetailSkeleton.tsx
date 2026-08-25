import { Skeleton } from "@/src/components/ui/skeleton";

export default function SpecialtyDetailSkeleton() {
  return (
    <div>
      <Skeleton className="w-full min-h-[40vh] max-h-[40vh]" />

      <div className="container py-4">
        <Skeleton className="h-5 w-60" />
      </div>

      <section className="container pb-14">
        <Skeleton className="h-10 w-96 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-11/12 mb-2" />
        <Skeleton className="h-4 w-9/12" />
      </section>

      <section className="container pb-14">
        <Skeleton className="h-10 w-80 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`specialty-doctor-skeleton-${index}`}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <Skeleton className="h-60 w-full rounded-none" />
              <div className="p-5 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-14">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-72 md:h-96 lg:h-120 w-full rounded-xl mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-11/12 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 md:h-80 lg:h-96 w-full rounded-xl" />
          <Skeleton className="h-64 md:h-80 lg:h-96 w-full rounded-xl" />
          <Skeleton className="h-64 md:h-80 lg:h-96 w-full rounded-xl" />
        </div>
      </section>
    </div>
  );
}
