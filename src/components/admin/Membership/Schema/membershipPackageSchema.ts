import { StatusType } from "@/src/types/common/common";
import * as Yup from "yup";

export const membershipPackageSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  benefits: Yup.array()
    .of(
      Yup.object({
        value: Yup.string().required("Benefit is required"),
      })
    )
    .min(1, "At least one benefit is required")
    .required("Benefits are required"),
  notices: Yup.array()
    .of(
      Yup.object({
        value: Yup.string().required("Notice is required"),
      })
    )
    .min(1, "At least one notice is required")
    .required("Notices are required"),
  benefitInput: Yup.string().notRequired(),
  noticeInput: Yup.string().notRequired(),
  status: Yup.string()
    .oneOf([StatusType.ACTIVE, StatusType.INACTIVE], "Invalid status")
    .required("Status is required"),
});

export type MembershipPackageSchemaForm = Yup.InferType<
  typeof membershipPackageSchema
>;
