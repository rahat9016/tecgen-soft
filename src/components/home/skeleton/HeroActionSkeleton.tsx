export default function HeroActionSkeleton() {
  return (
    <div className="container grid gap-2 lg:gap-0 grid-cols-1 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={`
            flex items-center gap-4 p-4 lg:p-8 bg-white rounded
            lg:rounded-none
            ${index === 0 ? "lg:rounded-l-[16px]" : ""}
            ${index === 2 ? "lg:rounded-r-[16px]" : ""}
            ${index !== 2 ? "lg:border-r lg:border-primary/10" : ""}
          `}
        >
          {/* Icon Skeleton */}
          <div className="h-8 lg:h-13.5 w-8 lg:w-13.5 rounded-full bg-muted shrink-0" />

          {/* Text Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
