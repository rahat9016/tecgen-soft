import * as yup from "yup";

export const checkoutValidationSchema = yup.object({
  fullName: yup.string().required("Name is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  email: yup.string().email("Please enter a valid email address").default(""),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  area: yup.string().required("Area/Thana is required"),
  postalCode: yup.string().required("Postal code is required"),
  paymentMethod: yup
    .mixed<"cod" | "card" | "mobile-banking">()
    .oneOf(["cod", "card", "mobile-banking"])
    .required(),
});

export type CheckoutFormType = yup.InferType<typeof checkoutValidationSchema>;
