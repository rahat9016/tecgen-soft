"use client";

const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm h-32 animate-pulse">
      <div className="space-y-3 h-full flex flex-col justify-between">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;
