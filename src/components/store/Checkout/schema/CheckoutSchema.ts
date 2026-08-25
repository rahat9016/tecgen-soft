import * as yup from "yup";

export const checkoutValidationSchema = yup.object({
  fullName: yup.string().required("নাম আবশ্যক"),
  phone: yup
    .string()
    .required("ফোন নম্বর আবশ্যক")
    .matches(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশী ফোন নম্বর দিন"),
  email: yup.string().email("সঠিক ইমেইল দিন").default(""),
  address: yup.string().required("ঠিকানা আবশ্যক"),
  city: yup.string().required("শহর আবশ্যক"),
  area: yup.string().required("এলাকা/থানা আবশ্যক"),
  postalCode: yup.string().required("পোস্টাল কোড আবশ্যক"),
  paymentMethod: yup
    .mixed<"cod" | "card" | "mobile-banking">()
    .oneOf(["cod", "card", "mobile-banking"])
    .required(),
});

export type CheckoutFormType = yup.InferType<typeof checkoutValidationSchema>;
