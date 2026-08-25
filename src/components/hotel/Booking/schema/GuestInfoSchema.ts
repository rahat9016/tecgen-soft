import * as yup from "yup";

export const guestInfoValidationSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
  note: yup.string().default(""),
});

export type GuestInfoFormType = yup.InferType<typeof guestInfoValidationSchema>;
