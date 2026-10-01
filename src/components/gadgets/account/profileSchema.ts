import * as Yup from "yup";
import { bdPhone, checkoutCities } from "../checkoutSchema";

export const profileSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required").max(80, "Name must be at most 80 characters"),
  phone: bdPhone(),
  email: Yup.string().trim().email("Enter a valid email").default(""),
  city: Yup.string().required("City is required").oneOf(checkoutCities, "Select a city"),
  address: Yup.string().trim().default(""),
});

export type ProfileFormValues = Yup.InferType<typeof profileSchema>;
