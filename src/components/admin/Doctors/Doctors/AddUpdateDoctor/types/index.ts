export type IDoctorFormType = {
  image: File | string;
  doctorId: string;
  email: string;
  fullName: string;
  bookingType: "ONSITE" | "TELE_ONLINE";
  status: "ACTIVE" | "ON_LEAVE";
  gender: "MALE" | "FEMALE" | "OTHER";
  contactNumber: string;
  areaExpertise: { expertise: string }[];
  expertiseInput?: string;
  department: string;
  specialization: string;
  designation: string;
  newExpertise?: string;
};

export interface ISelectOption {
  label: string;
  value: string;
}
