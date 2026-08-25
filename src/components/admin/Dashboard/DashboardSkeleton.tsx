import AppointmentsChartSkeleton from "./Skeleton/AppointmentsChartSkeleton";
import AppointmentsOverviewTableSkeleton from "./Skeleton/AppointmentsOverviewTableSkeleton";
import MembershipRequestSkeleton from "./Skeleton/MembershipRequestSkeleton";
import PopularDepartmentsChartSkeleton from "./Skeleton/PopularDepartmentsChartSkeleton";
import StatCardSkeleton from "./Skeleton/StatCardSkeleton";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AppointmentsChartSkeleton />
        <PopularDepartmentsChartSkeleton />
        <MembershipRequestSkeleton />
      </div>

      <AppointmentsOverviewTableSkeleton />
    </div>
  );
};

export default DashboardSkeleton;
