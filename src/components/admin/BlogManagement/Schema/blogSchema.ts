import { StatusType } from "@/src/types/common/common";
import * as Yup from "yup";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const IMAGE_SIZE = 5 * 1024 * 1024;

export const blogSchema = Yup.object({
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

  title: Yup.string().required("Package title is required"),
  status: Yup.string()
    .oneOf(
      [StatusType.ACTIVE, StatusType.INACTIVE],
      "Status must be Active or Inactive"
    )
    .required("Status is required"),
  description: Yup.string().required("Description is required"),
});

export type BlogSchemaSchemaForm = Yup.InferType<typeof blogSchema>;
