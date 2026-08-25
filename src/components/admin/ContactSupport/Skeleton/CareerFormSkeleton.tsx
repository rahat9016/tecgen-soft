export default function CareerFormSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="border border-light-silver rounded-lg p-8 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gray-200" />
            <div className="h-5 w-44 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>

        {/* Image upload */}
        <div className="mt-6">
          <div className="h-40 w-full rounded-lg bg-gray-200" />
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-6 gap-x-6 mt-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>

          {/* Vacancy */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>

          {/* Salary Range */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>

          {/* Job Description */}
          <div className="lg:col-span-4 space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-28 w-full bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-end gap-4">
        <div className="h-10 w-24 bg-gray-200 rounded-md" />
        <div className="h-10 w-36 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}
