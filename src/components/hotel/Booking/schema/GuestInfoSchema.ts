import * as yup from "yup";

const digits = (value?: string) => (value ?? "").replace(/[\s()-]/g, "");
const BD_MOBILE = /^0?1[3-9]\d{8}$/;
const INTL_NUMBER = /^\d{5,14}$/;
const NID = /^(\d{10}|\d{13}|\d{17})$/;
const PASSPORT = /^[A-Z0-9]{6,12}$/i;

export const titles = ["Mr", "Ms", "Mrs", "Dr"] as const;
export const paymentOptions = ["hotel", "card", "wallet"] as const;

export const guestInfoValidationSchema = yup.object({
  title: yup.string().oneOf(titles).required(),
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),

  country: yup.string().required("Select your country"),
  otherCountry: yup
    .string()
    .trim()
    .default("")
    .when("country", { is: "OTHER", then: (s) => s.required("Enter your country") }),

  phoneCountry: yup.string().required(),
  customDial: yup
    .string()
    .trim()
    .default("")
    .when("phoneCountry", {
      is: "OTHER",
      then: (s) => s.required("Code required").matches(/^\+?\d{1,4}$/, "e.g. +971"),
    }),
  phone: yup
    .string()
    .required("Phone number is required")
    .test("phone", function (value) {
      const number = digits(value);
      if (this.parent.phoneCountry === "BD") {
        return BD_MOBILE.test(number) || this.createError({ message: "Enter a valid Bangladeshi mobile number, e.g. 01712345678" });
      }
      return INTL_NUMBER.test(number) || this.createError({ message: "Enter a valid phone number (digits only)" });
    }),

  idType: yup.string().oneOf(["nid", "passport"]).required(),
  idNumber: yup
    .string()
    .trim()
    .default("")
    .test("id", function (value) {
      if (!value) return true;
      if (this.parent.idType === "nid") {
        return NID.test(value) || this.createError({ message: "NID numbers have 10, 13 or 17 digits" });
      }
      return PASSPORT.test(value) || this.createError({ message: "Enter a valid passport number" });
    }),

  arrivalTime: yup.string().default(""),
  airportPickup: yup.boolean().default(false),
  note: yup.string().default(""),
  paymentMethod: yup.string().oneOf(paymentOptions).required("Choose how you'd like to pay"),
  acceptTerms: yup
    .boolean()
    .default(false)
    .test("accepted", "Please accept the hotel policies to continue", (value) => value === true),
});

export type GuestInfoFormType = yup.InferType<typeof guestInfoValidationSchema>;
