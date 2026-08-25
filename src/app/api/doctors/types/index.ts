export enum DoctorStatus {
  ACTIVE = "Active",
  ON_LEAVE = "On Leave",
}

export interface IDepartment {
  id: number;
  name: string;
}

export interface IDoctor {
  id: number;
  doctorId: string;
  fullName: string;
  gender: "Male" | "Female";
  contactNumber: string;
  email: string;
  bookingType: "Onsite" | "Online";
  status: DoctorStatus;

  image: string;

  department: IDepartment;
  designation: string;
  specialization: string;
  areaOfExpertise: string[];
}
