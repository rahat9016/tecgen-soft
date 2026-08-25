import * as Yup from "yup";

const SUPPORTED_RESUME_FORMATS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const RESUME_SIZE = 5 * 1024 * 1024;

export const careerApplySchema = Yup.object({
  fullName: Yup.string()
    .required("Full name is required")
    .max(120, "Full name must be at most 120 characters"),

  email: Yup.string()
    .required("Email is required")
    .email("Enter a valid email")
    .max(120, "Email must be at most 120 characters"),

  phone: Yup.string().required("Phone number is required"),

  gender: Yup.string()
    .oneOf(["MALE", "FEMALE"], "Please select a valid gender")
    .required("Gender is required"),

  resume: Yup.mixed<File>()
    .required("Resume is required")
    .test("fileType", "Only PDF, DOC, DOCX are allowed", (value) => {
      if (!(value instanceof File)) return false;
      return SUPPORTED_RESUME_FORMATS.includes(value.type);
    })
    .test("fileSize", "Resume must be less than 5MB", (value) => {
      if (!(value instanceof File)) return false;
      return value.size <= RESUME_SIZE;
    }),

  careerId: Yup.string().required("Career id is required"),
});

export type CareerApplySchemaForm = Yup.InferType<typeof careerApplySchema>;
