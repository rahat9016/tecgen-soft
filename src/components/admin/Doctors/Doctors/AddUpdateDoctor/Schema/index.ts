import * as yup from "yup";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const IMAGE_SIZE = 5 * 1024 * 1024;

export const doctorSchema = yup.object({
  image: yup
    .mixed<File | string>()
    .when("$isEditMode", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Image is required"),
    })
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
      typeof value === "string"
        ? true
        : value instanceof File
          ? value.size <= IMAGE_SIZE
          : true
    )
    .test(
      "validUrlOrFile",
      "Must provide a valid image or image URL.",
      (value) => (typeof value === "string" ? value.trim() !== "" : true)
    ),
  doctorId: yup.string().required("Doctor ID is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .when("$isEditMode", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Email is required"),
    }),

  fullName: yup.string().required("Full name is required"),
  bookingType: yup
    .string()
    .oneOf(["ONSITE", "TELE_ONLINE"])
    .when("$isEditMode", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Booking type is required"),
    }),
  status: yup
    .string()
    .oneOf(["ACTIVE", "ON_LEAVE"])
    .when("$isEditMode", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Status is required"),
    }),
  gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER"])
    .when("$isEditMode", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Gender is required"),
    }),
  contactNumber: yup
    .string()
    .when("$isEditMode", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Contact number is required"),
    })
    .matches(/^\+?\d+$/, "Invalid contact number"),

  department: yup.string().required("Department is required"),
  specialization: yup.string().when("$isEditMode", {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required("Specialization is required"),
  }),
  designation: yup.string().when("$isEditMode", {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required("Designation is required"),
  }),

  newExpertise: yup.string().notRequired(),

  areaExpertise: yup
    .array()
    .of(
      yup.object({
        expertise: yup.string().notRequired(),
      })
    )
    .notRequired()
    .default([]),

  expertiseInput: yup.string().notRequired(),
});
