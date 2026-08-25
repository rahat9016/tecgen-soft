"use client";

const MembershipRequestSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm h-80 animate-pulse">
      <div className="space-y-4 h-full">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipRequestSkeleton;
