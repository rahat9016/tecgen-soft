import { StatusType } from "@/src/types/common/common";

export interface IDepartment {
  id: number;
  name: string;
}

export interface IDoctor {
  id: number;
  doctorId: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  contactNumber: string;
  email: string;
  bookingType: "Online" | "Onsite";
  status: "Active" | "Inactive" | "Deactive";
  image: string;
  department: IDepartment;
  specialization: string;
  designation: string;
  areaOfExpertise: string[];
  actions?: string;
}

export interface ISpecialty {
  id: number | string;
  title: string;
  description: string;
  actions?: string;
  status: StatusType;
}
