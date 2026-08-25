export interface IDoctorCard {
  id: string;
  doctorId: string;
  fullName: string;
  image: string;
  department: {
    name: string;
  };
  designation: string;
}
