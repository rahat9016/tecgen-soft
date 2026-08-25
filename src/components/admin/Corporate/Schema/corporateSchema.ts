import { StatusType } from "@/src/types/common/common";
import * as Yup from "yup";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const IMAGE_SIZE = 5 * 1024 * 1024;

export const corporateSchema = Yup.object({
  imageUrl: Yup.mixed<File | string>()
    .required("Company logo is required")
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
    .test("fileSize", "Image size must be less than 5MB.", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= IMAGE_SIZE;
    })
    .test(
      "validUrlOrFile",
      "Must provide a valid image or image URL.",
      (value) => (typeof value === "string" ? value.trim() !== "" : true)
    ),

  name: Yup.string().trim().required("Company name is required"),

  url: Yup.string()
    .trim()
    .required("Website URL is required")
    .url("Please enter a valid website URL")
    .matches(
      /^(https?:\/\/)/,
      "Website URL must start with http:// or https://"
    ),

  description: Yup.string().trim().required("Description is required"),

  status: Yup.mixed<StatusType>()
    .oneOf([StatusType.ACTIVE, StatusType.INACTIVE])
    .required("Status is required"),
});

export type CorporateSchemaForm = Yup.InferType<typeof corporateSchema>;
