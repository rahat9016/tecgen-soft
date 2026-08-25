import { Skeleton } from "../ui/skeleton";

export default function DoctorDetailsSkeleton() {
  return (
    <div>
      {/* Top Card Skeleton */}
      <div className="bg-light p-5 lg:p-10 border border-light rounded-2xl flex flex-col lg:flex-row gap-6 min-h-100">
        {/* Image */}
        <Skeleton className="lg:w-142 lg:h-100 w-full h-64 rounded-xl shrink-0" />

        {/* Right Content */}
        <div className="w-full lg:min-h-100 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Name */}
            <Skeleton className="h-8 lg:h-10 w-2/3" />

            {/* Badge */}
            <Skeleton className="h-6 w-32 rounded-full" />

            {/* Designation */}
            <Skeleton className="h-5 w-1/2" />

            {/* Specialization */}
            <Skeleton className="h-5 w-1/3" />

            {/* Time */}
            <Skeleton className="h-12 w-40 mt-2" />
          </div>

          {/* Social Icons */}
          <div className="flex justify-end mt-6 lg:mt-0">
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expertise Section */}
      <div className="my-25">
        <Skeleton className="h-8 w-64 mb-6" />

        <ul className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </li>
          ))}
        </ul>

        <Skeleton className="h-12 w-48 mt-10 rounded-md" />
      </div>
    </div>
  );
}
