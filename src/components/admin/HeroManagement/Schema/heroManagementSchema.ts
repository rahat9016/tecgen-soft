import * as Yup from "yup";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const IMAGE_SIZE = 5 * 1024 * 1024;
export const heroManagementSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title must be at most 100 characters"),

  description: Yup.string()
    .required("Description is required")
    .max(500, "Description must be at most 500 characters"),

  images: Yup.array()
    .of(
      Yup.mixed<File | string>()
        .required("Image is required")
        .test(
          "fileType",
          "Unsupported image format. Allowed: JPG, PNG, WEBP.",
          (value) => {
            if (typeof value === "string") return true; // URL is fine
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
        )
    )
    .min(1, "At least one image is required")
    .max(5, "You can upload a maximum of 5 images")
    .required("Images are required"),
});
export type HeroManagementSchemaForm = Yup.InferType<
  typeof heroManagementSchema
>;
