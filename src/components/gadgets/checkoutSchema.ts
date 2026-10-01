import * as Yup from "yup";
import type { PaymentMethod } from "@/src/lib/gadget-store/types";

export const checkoutCities = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
];

export const checkoutSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required").max(80, "Name must be at most 80 characters"),
  // Bangladeshi mobile: 01XXXXXXXXX, optionally prefixed with +88 / 88; spaces and dashes allowed.
  phone: Yup.string()
    .required("Phone number is required")
    .test("bd-phone", "Enter a valid mobile number, e.g. 01712-345678", (v) =>
      /^(88)?01[3-9]\d{8}$/.test((v ?? "").replace(/[\s+-]/g, ""))
    ),
  email: Yup.string().trim().email("Enter a valid email").default(""),
  city: Yup.string().required("City is required").oneOf(checkoutCities, "Select a city"),
  address: Yup.string().trim().required("Address is required").min(5, "Enter your full address"),
  note: Yup.string().max(300, "Note must be at most 300 characters").default(""),
  payment: Yup.mixed<PaymentMethod>().required("Choose a payment method"),
});

export type CheckoutFormValues = Yup.InferType<typeof checkoutSchema>;
