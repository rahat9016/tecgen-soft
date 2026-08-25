import { DashboardData, StatItem } from "@/src/types/index";

const formatChange = (percent: number | null | undefined) => {
  if (typeof percent !== "number" || Number.isNaN(percent)) {
    return {};
  }
  const rounded = Math.round(percent * 10) / 10;
  return {
    change: `${rounded > 0 ? "+" : ""}${rounded}%`,
    isPositive: rounded >= 0,
  };
};

export const transformDashboardData = (
  dashboardData: DashboardData | undefined
): StatItem[] => [
  {
    title: "Today's Appointments",
    value: dashboardData?.todayAppointment || 0,
    ...formatChange(dashboardData?.todayAppointmentChangePercent),
  },
  {
    title: "Online Bookings",
    value: dashboardData?.onlineBooking || 0,
    ...formatChange(dashboardData?.onlineBookingChangePercent),
  },
  {
    title: "Total Packages",
    value: dashboardData?.totalPackages || 0,
    ...formatChange(dashboardData?.totalPackagesChangePercent),
  },
  {
    title: "Active Memberships",
    value: dashboardData?.totalMemberships || 0,
    ...formatChange(dashboardData?.totalMembershipsChangePercent),
  },
];
