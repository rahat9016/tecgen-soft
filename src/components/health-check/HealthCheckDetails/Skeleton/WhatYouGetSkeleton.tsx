import Paragraph from "@/src/components/shared/Paragraph";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function WhatYouGetSkeleton() {
  return (
    <div className="mt-6">
      {/* Title */}
      <Paragraph className="mb-4">
        <Skeleton className="h-5 w-40" />
      </Paragraph>

      {/* Box */}
      <div className="bg-[#F7F7F7] border border-light-silver px-8 py-10 rounded-md">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="flex items-center gap-2">
              {/* Bullet */}
              <Skeleton className="h-2 w-2 rounded-full" />
              {/* Text */}
              <Skeleton className="h-4 w-[80%]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
