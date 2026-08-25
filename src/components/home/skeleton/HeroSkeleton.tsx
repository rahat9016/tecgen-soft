import HeroActionSkeleton from "./HeroActionSkeleton";

export default function HeroSkeleton() {
  return (
    <div className=" relative h-[75vh] w-full overflow-hidden bg-white animate-pulse">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 container h-full flex flex-col items-center justify-center text-center px-4">
        {/* Title Skeleton */}
        <div className="h-6 md:h-8 lg:h-14 xl:h-20 w-3/4 max-w-4xl rounded bg-white" />

        {/* Description Skeleton */}
        <div className="mt-4 space-y-2 w-full max-w-3xl">
          <div className="h-4 rounded bg-white" />
          <div className="h-4 w-5/6 mx-auto rounded bg-white" />
        </div>

        {/* Action Skeleton */}
        <div className="mt-8 xl:mt-20 w-full">
          <HeroActionSkeleton />
        </div>
      </div>
    </div>
  );
}
