import * as yup from "yup";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const IMAGE_SIZE = 5 * 1024 * 1024;

const requiredWhenActiveString = (fieldLabel: string) =>
  yup.string().when("isActive", {
    is: true,
    then: (schema) => schema.required(`${fieldLabel} is required`),
    otherwise: (schema) => schema.notRequired(),
  });

const imageSchema = yup
  .mixed<File | string>()
  .nullable()
  .test(
    "fileType",
    "Unsupported image format. Allowed: JPG, PNG, WEBP.",
    (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (value instanceof File)
        return SUPPORTED_IMAGE_FORMATS.includes(value.type);
      return false;
    }
  )
  .test("fileSize", "Image size must be less than 5MB.", (value) => {
    if (value === null || value === undefined) return true;
    return typeof value === "string" ? true : value.size <= IMAGE_SIZE;
  });

const optionalImageSchema = yup
  .mixed<File | string>()
  .nullable()
  .notRequired()
  .test("fileType", "Unsupported image format (JPG, PNG, WEBP)", (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() !== "";
    if (value instanceof File)
      return SUPPORTED_IMAGE_FORMATS.includes(value.type);
    return false;
  })
  .test("fileSize", "Image must be less than 5MB", (value) => {
    if (value === null || value === undefined) return true;
    return typeof value === "string" ? true : value.size <= IMAGE_SIZE;
  });

const requiredImageSchema = yup
  .mixed<File | string>()
  .nullable()
  .test("requiredImage", "Image is required", (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  })
  .test("fileType", "Unsupported image format (JPG, PNG, WEBP)", (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (value instanceof File)
      return SUPPORTED_IMAGE_FORMATS.includes(value.type);
    return false;
  })
  .test("fileSize", "Image must be less than 5MB", (value) => {
    if (value === null || value === undefined) return true;
    return typeof value === "string" ? true : value.size <= IMAGE_SIZE;
  });

const positionedOptionalImageSchema = yup.object({
  imageUrl: optionalImageSchema,
  position: yup.number().required(),
});

const positionedRequiredImageSchema = yup.object({
  imageUrl: requiredImageSchema,
  position: yup.number().required(),
});

export const specialtySchema = yup.object({
  hero: yup.object({
    title: yup.string().required("Hero title is required"),
    description: yup.string().required("Hero description is required"),
    coverImage: imageSchema.required("Hero image is required"),
    status: yup
      .mixed<"ACTIVE" | "INACTIVE">()
      .oneOf(["ACTIVE", "INACTIVE"])
      .required("Hero status is required"),
  }),

  doctorSection: yup.object({
    title: yup.string().when("isActive", {
      is: true,
      then: (schema) => schema.required("Doctor section title is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    order: yup.number().required(),
    isActive: yup.boolean().default(true).required(),
    doctors: yup
      .array()
      .of(
        yup.object({
          id: yup.string().required(),
          doctorId: yup.string().required(),
          fullName: yup.string().required(),
          image: yup.string().required(),
          status: yup
            .mixed<"ACTIVE" | "INACTIVE">()
            .oneOf(["ACTIVE", "INACTIVE"])
            .required(),
          department: yup
            .object({
              id: yup.string().required(),
              name: yup.string().required(),
            })
            .required(),
        })
      )
      .when("isActive", {
        is: true,
        then: (schema) =>
          schema
            .min(1, "At least one doctor is required")
            .required("At least one doctor is required"),
        otherwise: (schema) => schema.default([]).notRequired(),
      }),
  }),

  sections: yup.object({
    sectionOne: yup.object({
      title: requiredWhenActiveString("Section 1 title"),
      description: requiredWhenActiveString("Section 1 description"),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
    }),

    sectionTwo: yup.object({
      title: requiredWhenActiveString("Section 2 title"),
      description: requiredWhenActiveString("Section 2 description"),
      coverImage: yup
        .mixed<File | string>()
        .nullable()
        .when("isActive", {
          is: true,
          then: () => requiredImageSchema,
          otherwise: () => optionalImageSchema,
        }),
      images: yup
        .array()
        .when("isActive", {
          is: true,
          then: (schema) => schema.of(positionedRequiredImageSchema),
          otherwise: (schema) => schema.of(positionedOptionalImageSchema),
        })
        .min(4, "Section 2 images are required")
        .length(4, "Section 2 requires exactly 4 image fields")
        .required("Section 2 images are required")
        .test(
          "position-0-cover-sync",
          "Cover image must be stored in image position 0",
          function (images) {
            const coverImage = this.parent?.coverImage;
            if (!images || images.length < 1) return false;

            const firstImage = images[0]?.imageUrl;

            if (
              coverImage === null ||
              coverImage === undefined ||
              coverImage === ""
            ) {
              return (
                firstImage === null ||
                firstImage === undefined ||
                firstImage === ""
              );
            }

            return firstImage === coverImage;
          }
        )
        .test(
          "position-shape",
          "Section 2 image positions must be 0, 1, 2, and 3",
          function (images) {
            if (!images || images.length !== 4) return false;

            const positions = images.map((item) => item?.position);
            return (
              positions[0] === 0 &&
              positions[1] === 1 &&
              positions[2] === 2 &&
              positions[3] === 3
            );
          }
        ),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
    }),

    sectionThree: yup.object({
      title: requiredWhenActiveString("Section 3 title"),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
      items: yup
        .array()
        .of(
          yup.object({
            id: yup.string().optional(),
            title: yup.string().required("Item title is required"),
            description: yup.string().optional(),
            status: yup
              .mixed<"ACTIVE" | "INACTIVE">()
              .oneOf(["ACTIVE", "INACTIVE"])
              .required("Item status is required"),
            actions: yup.string().optional(),
          })
        )
        .when("isActive", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "At least one list item is required")
              .required("List items are required"),
          otherwise: (schema) => schema.default([]).notRequired(),
        }),
    }),

    sectionFour: yup.object({
      title: requiredWhenActiveString("Section 4 title"),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
      items: yup
        .array()
        .of(
          yup.object({
            id: yup.string().optional(),
            title: yup.string().required("Item title is required"),
            description: yup.string().optional(),
            status: yup
              .mixed<"ACTIVE" | "INACTIVE">()
              .oneOf(["ACTIVE", "INACTIVE"])
              .required("Item status is required"),
            actions: yup.string().optional(),
          })
        )
        .when("isActive", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "At least one list item is required")
              .required("List items are required"),
          otherwise: (schema) => schema.default([]).notRequired(),
        }),
    }),

    sectionFive: yup.object({
      title: requiredWhenActiveString("Section 5 title"),
      description: requiredWhenActiveString("Section 5 description"),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
    }),

    sectionSix: yup.object({
      title: requiredWhenActiveString("Section 6 title"),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
      items: yup
        .array()
        .of(
          yup.object({
            id: yup.string().optional(),
            title: yup.string().required("Item title is required"),
            description: yup.string().optional(),
            status: yup
              .mixed<"ACTIVE" | "INACTIVE">()
              .oneOf(["ACTIVE", "INACTIVE"])
              .required("Item status is required"),
            actions: yup.string().optional(),
          })
        )
        .when("isActive", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "At least one list item is required")
              .required("List items are required"),
          otherwise: (schema) => schema.default([]).notRequired(),
        }),
    }),

    sectionSeven: yup.object({
      title: requiredWhenActiveString("Section 7 title"),
      description: requiredWhenActiveString("Section 7 description"),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
      items: yup
        .array()
        .of(
          yup.object({
            id: yup.string().optional(),
            title: yup.string().required("Item title is required"),
            description: yup.string().optional(),
            status: yup
              .mixed<"ACTIVE" | "INACTIVE">()
              .oneOf(["ACTIVE", "INACTIVE"])
              .required("Item status is required"),
            actions: yup.string().optional(),
          })
        )
        .when("isActive", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "At least one list item is required")
              .required("List items are required"),
          otherwise: (schema) => schema.default([]).notRequired(),
        }),
    }),

    sectionEight: yup.object({
      title: requiredWhenActiveString("Section 8 title"),
      description: requiredWhenActiveString("Section 8 description"),
      order: yup.number().required(),
      isActive: yup.boolean().default(true).required(),
    }),
  }),
});

export type SpecialtySchemaForm = yup.InferType<typeof specialtySchema>;
