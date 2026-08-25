export default function CareerDetailsSkeleton() {
  return (
    <div className="container mt-6 mb-10 lg:mb-20">
      <div className="h-6 w-52 bg-muted rounded mb-5" />
      <div className="h-10 w-80 bg-muted rounded mb-3" />
      <div className="h-5 w-56 bg-muted rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-52 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-10/12 bg-muted rounded" />
          <div className="h-4 w-11/12 bg-muted rounded" />
        </div>
        <div className="h-80 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}
