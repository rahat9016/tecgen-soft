import { StatusType } from "@/src/types/common/common";

export enum AppointmentType {
  ALL = "all-appointment",
  ONSITE = "onsite-appointment",
  TELEONLINE = "tele-online-appointment",
}

export interface IAppointment {
  bookingID: string;
  patientName: string;
  doctor: string;
  department: string;
  dateTime: string;
  bookingType: string;
  status: StatusType;
  appointmentType: AppointmentType;
}
