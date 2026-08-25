"use client";

const AppointmentsOverviewTableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsOverviewTableSkeleton;
