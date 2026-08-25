import { StatusType } from "@/src/types/common/common";
import * as Yup from "yup";
import { JobType } from "../types";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const IMAGE_SIZE = 5 * 1024 * 1024;

export const careerSchema = Yup.object({
  image: Yup.mixed<File | string>()
    .required("Image is required")
    .test(
      "fileType",
      "Unsupported image format. Allowed: JPG, PNG, WEBP.",
      (value) => {
        if (typeof value === "string") return true;
        if (value instanceof File) {
          return SUPPORTED_IMAGE_FORMATS.includes(value.type);
        }
        return false;
      }
    )
    .test("fileSize", "Image size must be less than 5MB.", (value) =>
      typeof value === "string" ? true : value.size <= IMAGE_SIZE
    )
    .test(
      "validUrlOrFile",
      "Must provide a valid image or image URL.",
      (value) => (typeof value === "string" ? value.trim() !== "" : true)
    ),

  title: Yup.string().required("Job title is required"),

  salary: Yup.number().required("Salary range is required").default(0),

  description: Yup.string().required("Description is required"),

  vacancy: Yup.number()
    .typeError("Vacancy must be a number")
    .required("Vacancy is required")
    .min(1, "At least 1 vacancy required"),

  location: Yup.string().required("Location is required"),

  deadline: Yup.string()
    .required("Deadline is required")
    .test("valid-date", "Invalid deadline date", (value) =>
      value ? !isNaN(new Date(value).getTime()) : false
    ),

  status: Yup.mixed<StatusType>()
    .oneOf([StatusType.ACTIVE, StatusType.INACTIVE])
    .required("Status is required"),

  experience: Yup.string().required("Experience is required"),

  jobType: Yup.string()
    .oneOf(Object.values(JobType), "Invalid job type")
    .required("Job type is required"),
});

export type CareerSchemaForm = Yup.InferType<typeof careerSchema>;
