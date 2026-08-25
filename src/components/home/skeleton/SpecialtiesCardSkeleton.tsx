import { Skeleton } from "../../ui/skeleton";

export default function SpecialtiesCardSkeleton() {
  return (
    <div className="group">
      <div className="bg-white flex flex-col items-center justify-center border border-light-silver rounded-2xl p-6">
        {/* Title */}
        <Skeleton className="h-5 w-32 mb-2" />

        {/* Description */}
        <div className="space-y-2 w-full flex flex-col items-center">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Button */}
        <Skeleton className="h-9 w-28 mt-4 rounded-md" />
      </div>
    </div>
  );
}
