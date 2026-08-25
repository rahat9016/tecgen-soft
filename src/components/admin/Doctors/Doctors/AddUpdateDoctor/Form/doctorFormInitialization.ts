import {
  mapBookingTypeToForm,
  mapGenderToForm,
  mapStatusToForm,
} from "@/src/utils/doctorValueMappers";
import { IDoctor } from "../../../types";
import { IDoctorFormType } from "../types";

export const getDoctorDefaultValues = (): IDoctorFormType => ({
  image: "",
  doctorId: "",
  email: "",
  fullName: "",
  bookingType: "ONSITE",
  status: "ACTIVE",
  gender: "MALE",
  contactNumber: "",
  department: "",
  specialization: "",
  designation: "",
  newExpertise: "",
  areaExpertise: [],
});

export const getDoctorInitialFormValues = (
  initialValues?: IDoctor
): IDoctorFormType => {
  if (!initialValues) {
    return getDoctorDefaultValues();
  }
  return {
    image: initialValues.image,
    doctorId: initialValues.doctorId ?? "",
    email: initialValues.email ?? "",
    fullName: initialValues.fullName ?? "",
    bookingType: mapBookingTypeToForm(initialValues.bookingType),
    status: mapStatusToForm(initialValues.status),
    gender: mapGenderToForm(initialValues.gender),
    contactNumber: initialValues.contactNumber ?? "",
    department: initialValues?.department?.id ?? "",
    specialization: initialValues.specialization ?? "",
    designation: initialValues.designation ?? "",
    newExpertise: "",
    areaExpertise: (initialValues.areaOfExpertise || []).map((expertise) => ({
      expertise,
    })),
  };
};
