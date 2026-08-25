import { BookingType, Gender, StatusType } from "@/src/types/common/common";

export enum DoctorStatus {
  ACTIVE = "ACTIVE",
  ON_LEAVE = "ON_LEAVE",
}
export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface IDoctorSchedules {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDepartment {
  id: string;
  name: string;
}

export interface IDoctor {
  id: string;
  doctorId: string;
  fullName: string;
  gender: Gender;
  contactNumber: string;
  email: string;
  bookingType: BookingType;
  status: StatusType;
  image: string;
  departmentId: string;
  department: IDepartment;
  specialization: string;
  designation: string;
  areaOfExpertise: string[];
  doctorSchedules: IDoctorSchedules[];
  actions?: string;
  createdAt: string;
  updatedAt: string;
}
export interface IDoctorList {
  id: string;
  doctorNo: string;
  doctorName: string;
  department: {
    id: string;
    name: string;
  };
}
