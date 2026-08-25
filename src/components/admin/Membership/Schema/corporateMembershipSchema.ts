import { StatusType } from "@/src/types/common/common";
import * as Yup from "yup";

const contactPhoneRegex = /^01\d{9}$/;
const employeePhoneRegex = /^01\d{9}$/;
const statusValues = [
  StatusType.ACTIVE,
  StatusType.INACTIVE,
  StatusType.PENDING,
  StatusType.REJECTED,
] as const;

const optionalString = () =>
  Yup.string().transform((value, originalValue) =>
    originalValue === "" ? undefined : value
  );

const hasDuplicateValue = (
  items: Array<Record<string, unknown>>,
  key: "employeeId" | "email" | "phone"
) => {
  const seen = new Set<string>();

  for (const item of items) {
    const rawValue = item?.[key];

    if (rawValue === undefined || rawValue === null || rawValue === "") {
      continue;
    }

    const normalizedValue = String(rawValue).trim().toLowerCase();

    if (seen.has(normalizedValue)) {
      return true;
    }

    seen.add(normalizedValue);
  }

  return false;
};

const employeeSchema = Yup.object({
  employeeId: Yup.string().required("Employee ID is required"),
  name: Yup.string().required("Employee name is required"),
  designation: optionalString(),
  phone: optionalString().matches(employeePhoneRegex, {
    message: "Employee phone must be a valid BD number",
    excludeEmptyString: true,
  }),
  email: Yup.string()
    .email("Invalid employee email")
    .required("Employee email is required"),
  status: optionalString().oneOf(statusValues, "Invalid status"),
});

export const corporateMembershipSchema = Yup.object({
  companyName: Yup.string().required("Company name is required"),
  contactPerson: Yup.string().required("Contact person is required"),
  contactNumber: Yup.string()
    .matches(contactPhoneRegex, "Contact number must be valid")
    .required("Contact number is required"),
  totalEmployees: Yup.number()
    .typeError("Total employees must be a number")
    .integer("Total employees must be an integer")
    .min(1, "Total employees must be at least 1")
    .required("Total employees is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  contactPersonDesignation: Yup.string().optional(),
  address: optionalString(),
  tradeLicense: optionalString(),
  industryType: optionalString(),
  discount: Yup.number()
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be less than 0")
    .max(100, "Discount cannot be greater than 100")
    .optional(),
  status: Yup.string().oneOf(statusValues, "Invalid status").optional(),
  packageId: Yup.string().required("Package is required"),
  employees: Yup.array()
    .of(employeeSchema)
    .test(
      "unique-employee-id",
      "Duplicate employee ID is not allowed",
      (employees) => {
        if (!employees?.length) return true;
        return !hasDuplicateValue(
          employees as unknown as Array<Record<string, unknown>>,
          "employeeId"
        );
      }
    )
    .test(
      "unique-employee-email",
      "Duplicate employee email is not allowed",
      (employees) => {
        if (!employees?.length) return true;
        return !hasDuplicateValue(
          employees as unknown as Array<Record<string, unknown>>,
          "email"
        );
      }
    )
    .test(
      "unique-employee-phone",
      "Duplicate employee phone is not allowed",
      (employees) => {
        if (!employees?.length) return true;
        return !hasDuplicateValue(
          employees as unknown as Array<Record<string, unknown>>,
          "phone"
        );
      }
    )
    .test(
      "employee-phone-not-company-contact",
      "Employee phone cannot be same as company contact number",
      function (employees) {
        if (!employees?.length) return true;

        const companyContactNumber = String(this.parent?.contactNumber || "")
          .trim()
          .toLowerCase();

        if (!companyContactNumber) return true;

        return !employees.some(
          (employee) =>
            String(employee?.phone || "")
              .trim()
              .toLowerCase() === companyContactNumber
        );
      }
    )
    .test(
      "employee-email-not-company-email",
      "Employee email cannot be same as company email",
      function (employees) {
        if (!employees?.length) return true;

        const companyEmail = String(this.parent?.email || "")
          .trim()
          .toLowerCase();

        if (!companyEmail) return true;

        return !employees.some(
          (employee) =>
            String(employee?.email || "")
              .trim()
              .toLowerCase() === companyEmail
        );
      }
    )
    .optional(),
});

export type CorporateMembershipSchemaForm = Yup.InferType<
  typeof corporateMembershipSchema
>;
