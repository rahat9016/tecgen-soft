"use client";

import { useGet } from "@/src/hooks/useGet";
import { DashboardData } from "@/src/types/index";
import { transformDashboardData } from "@/src/utils/dashboard";
import AppointmentsChart from "./AppointmentsChart";
import AppointmentsOverviewTable from "./AppointmentsOverviewTable";
import MembershipRequest from "./MembershipRequest";
import PopularDepartmentsChart from "./PopularDepartmentsChart";
import StatCard from "./StatCard";

export default function AdminDashboard() {
  const { data } = useGet<DashboardData>("/dashboard", ["dashboard"]);

  const dashboardData = data?.data;
  const statsData = transformDashboardData(dashboardData);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
          />
        ))}
      </div>

      {/* Charts & Membership Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AppointmentsChart />
        <PopularDepartmentsChart />
        <MembershipRequest />
      </div>

      <AppointmentsOverviewTable />
    </div>
  );
}
