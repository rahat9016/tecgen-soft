export interface IAppointment {
  appointNo: string;
  appointDate: string;
  doctorNo: string;
  doctorName: string;
  patientName: string | null;
  fullName: string | null;
  bookingType: string;
  onlineFg: string;
}
