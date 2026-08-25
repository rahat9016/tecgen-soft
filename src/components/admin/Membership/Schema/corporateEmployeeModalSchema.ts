import { StatusType } from "@/src/types/common/common";
import * as Yup from "yup";

export const corporateEmployeeModalSchema = Yup.object({
  employeeId: Yup.string().required("Employee ID is required"),
  name: Yup.string().required("Employee name is required"),
  designation: Yup.string().required("Designation is required"),
  phone: Yup.string()
    .matches(/^01\d{9}$/, "Employee phone must be a valid BD number")
    .required("Phone is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
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
    .required("Status is required"),
});

export type CorporateEmployeeModalSchemaForm = Yup.InferType<
  typeof corporateEmployeeModalSchema
>;
