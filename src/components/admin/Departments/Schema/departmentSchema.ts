import { StatusType } from "@/src/types/common/common";
import * as Yup from "yup";

export const departmentSchema = Yup.object({
  name: Yup.string().required("Department name is required"),
  status: Yup.string()
    .oneOf(
      [StatusType.ACTIVE, StatusType.INACTIVE],
      "Status must be Active or Inactive"
    )
    .required("Status is required"),
});

export type DepartmentSchemaForm = Yup.InferType<typeof departmentSchema>;
