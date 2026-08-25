import { Gender, StatusType } from "@/src/types/common/common";
import * as Yup from "yup";
import { RelationshipType } from "../types";

const phoneRegex = /^01\d{9}$/;
const optionalString = Yup.string().transform((value, originalValue) => {
  return originalValue === "" ? undefined : value;
});

const optionalNumber = Yup.number().transform((value, originalValue) => {
  return originalValue === "" || originalValue === null ? undefined : value;
});

export const generalMembershipSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  gender: Yup.string()
    .oneOf([Gender.MALE, Gender.FEMALE], "Invalid gender")
    .required("Gender is required"),
  contactNumber: Yup.string()
    .matches(phoneRegex, "Contact number must be 11 digits")
    .required("Contact number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  dateOfBirth: optionalString.optional(),
  nationalId: optionalString.optional(),
  bloodGroup: optionalString
    .oneOf(
      ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "Invalid blood group"
    )
    .optional(),
  address: optionalString.optional(),
  discount: optionalNumber
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be less than 0")
    .max(100, "Discount cannot be greater than 100")
    .optional(),
  status: Yup.string()
    .oneOf(
      [
        StatusType.ACTIVE,
        StatusType.INACTIVE,
        StatusType.PENDING,
        StatusType.REJECTED,
      ],
      "Invalid status"
    )
    .optional(),
  emergency: Yup.object({
    name: optionalString.optional(),
    phone: Yup.string()
      .matches(phoneRegex, {
        message: "Emergency phone must be 11 digits",
        excludeEmptyString: true,
      })
      .optional(),
    relation: optionalString
      .oneOf(Object.values(RelationshipType), "Invalid relation")
      .optional(),
  }).optional(),
});

export interface GeneralMembershipSchemaForm {
  name: string;
  gender: Gender;
  dateOfBirth?: string;
  contactNumber: string;
  email: string;
  nationalId?: string;
  bloodGroup?: string;
  address?: string;
  discount?: number;
  status?: StatusType;
  emergency?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
}
