export default function DoctorFormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="flex flex-col gap-4 p-8 border border-light-silver rounded-lg bg-white animate-pulse">
        <div className="flex items-center gap-3 mb-5 xl:mb-8">
          <div className="h-9 w-9 bg-muted rounded-md" />
          <div className="h-5 w-48 bg-muted rounded" />
        </div>
        <div className="h-36 bg-muted rounded-lg" /> {/* Image upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5 xl:mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Specialization & Qualifications */}
      <div className="flex flex-col gap-4 p-8 border border-light-silver rounded-lg bg-white animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 bg-muted rounded-md" />
          <div className="h-5 w-48 bg-muted rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Area of Expertise */}
      <div className="border border-light-silver rounded-lg p-8 bg-white animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-muted rounded-md" />
            <div className="h-5 w-48 bg-muted rounded" />
          </div>
          <div className="h-11 w-24 bg-muted rounded" />
        </div>
        <div className="h-12 bg-muted rounded" /> {/* Input field */}
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-13 bg-muted rounded-lg" />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <div className="h-11 w-40 bg-muted rounded" />
      </div>
    </div>
  );
}
