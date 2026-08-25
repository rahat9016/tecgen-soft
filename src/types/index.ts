// Change fields are null until the backend has a previous-day baseline to compare against.
type ChangeValue = number | null | undefined;

export interface DashboardData {
  todayAppointment: number;
  todayAppointmentChange?: ChangeValue;
  todayAppointmentChangePercent?: ChangeValue;
  onlineBooking: number;
  onlineBookingChange?: ChangeValue;
  onlineBookingChangePercent?: ChangeValue;
  totalPackages: number;
  totalPackagesChange?: ChangeValue;
  totalPackagesChangePercent?: ChangeValue;
  totalHealthPackages?: number;
  totalHealthPackagesChange?: ChangeValue;
  totalHealthPackagesChangePercent?: ChangeValue;
  totalMemberships: number;
  totalMembershipsChange?: ChangeValue;
  totalMembershipsChangePercent?: ChangeValue;
}

export interface StatItem {
  title: string;
  value: number;
  change?: string;
  isPositive?: boolean;
}

export interface IGeneralMembership {
  id: string;
  name: string;
  email: string;
  gender?: string;
  dateOfBirth?: string | null;
  bloodGroup?: string;
  contactNumber?: string;
  nationalId?: string | null;
  createdAt?: string;
  status?: string;
  updatedAt?: string;
  emergency?: unknown;
}
