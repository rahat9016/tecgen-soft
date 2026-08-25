"use client";

const AppointmentsChartSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm h-80 animate-pulse">
      <div className="space-y-4 h-full">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsChartSkeleton;
