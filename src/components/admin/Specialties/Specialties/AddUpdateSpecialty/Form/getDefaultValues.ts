import { SpecialtySchemaForm } from "../Schema";
import { ISectionImageInput, ISpecialtyFormType } from "../types";

const normalizeDoctorStatus = (status?: string): "ACTIVE" | "INACTIVE" =>
  status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

const DEFAULT_SECTION_TWO_IMAGES: ISectionImageInput[] = [
  { imageUrl: null, position: 0 },
  { imageUrl: null, position: 1 },
  { imageUrl: null, position: 2 },
  { imageUrl: null, position: 3 },
];

const normalizeSectionTwoImages = (
  images?: ISectionImageInput[]
): ISectionImageInput[] => {
  const safeImages = images || [];

  return DEFAULT_SECTION_TWO_IMAGES.map((defaultImage, index) => {
    const positionedImage = safeImages.find(
      (item) => item?.position === defaultImage.position
    );
    const fallbackByIndex = safeImages[index];

    return {
      position: defaultImage.position,
      imageUrl:
        positionedImage?.imageUrl ??
        fallbackByIndex?.imageUrl ??
        defaultImage.imageUrl,
    };
  });
};

const BASE_DEFAULT_VALUES: SpecialtySchemaForm = {
  hero: {
    title: "",
    description: "",
    coverImage: "",
    status: "ACTIVE",
  },
  doctorSection: {
    title: "",
    order: 0,
    isActive: true,
    doctors: [],
  },
  sections: {
    sectionOne: {
      title: "",
      description: "",
      order: 1,
      isActive: true,
    },
    sectionTwo: {
      title: "",
      description: "",
      coverImage: null,
      images: DEFAULT_SECTION_TWO_IMAGES,
      order: 2,
      isActive: true,
    },
    sectionThree: {
      title: "",
      order: 3,
      isActive: true,
      items: [],
    },
    sectionFour: {
      title: "",
      order: 4,
      isActive: true,
      items: [],
    },
    sectionFive: {
      title: "",
      description: "",
      order: 5,
      isActive: true,
    },
    sectionSix: {
      title: "",
      order: 6,
      isActive: true,
      items: [],
    },
    sectionSeven: {
      title: "",
      description: "",
      order: 7,
      isActive: true,
      items: [],
    },
    sectionEight: {
      title: "",
      description: "",
      order: 8,
      isActive: true,
    },
  },
};

export const getDefaultValues = (
  initialValues?: Partial<ISpecialtyFormType>
): SpecialtySchemaForm => {
  if (!initialValues) {
    return BASE_DEFAULT_VALUES;
  }

  const heroCoverImage =
    initialValues.hero?.coverImage === null
      ? ""
      : (initialValues.hero?.coverImage ?? BASE_DEFAULT_VALUES.hero.coverImage);

  const sectionTwoImages = normalizeSectionTwoImages(
    initialValues.sections?.sectionTwo?.images
  );

  const sectionTwoCoverImage =
    initialValues.sections?.sectionTwo?.coverImage ??
    sectionTwoImages.find((item) => item.position === 0)?.imageUrl ??
    null;

  return {
    ...BASE_DEFAULT_VALUES,
    ...initialValues,
    hero: {
      ...BASE_DEFAULT_VALUES.hero,
      ...(initialValues.hero || {}),
      coverImage: heroCoverImage,
    },
    doctorSection: {
      ...BASE_DEFAULT_VALUES.doctorSection,
      ...(initialValues.doctorSection || {}),
      order: 1,
      doctors: (initialValues.doctorSection?.doctors || []).map((doctor) => ({
        ...doctor,
        status: normalizeDoctorStatus(doctor.status),
      })),
    },
    sections: {
      ...BASE_DEFAULT_VALUES.sections,
      ...(initialValues.sections || {}),
      sectionOne: {
        ...BASE_DEFAULT_VALUES.sections.sectionOne,
        ...(initialValues.sections?.sectionOne || {}),
      },
      sectionTwo: {
        ...BASE_DEFAULT_VALUES.sections.sectionTwo,
        ...(initialValues.sections?.sectionTwo || {}),
        coverImage: sectionTwoCoverImage,
        images: sectionTwoImages,
      },
      sectionThree: {
        ...BASE_DEFAULT_VALUES.sections.sectionThree,
        ...(initialValues.sections?.sectionThree || {}),
        items:
          initialValues.sections?.sectionThree?.items ||
          BASE_DEFAULT_VALUES.sections.sectionThree.items,
      },
      sectionFour: {
        ...BASE_DEFAULT_VALUES.sections.sectionFour,
        ...(initialValues.sections?.sectionFour || {}),
        items:
          initialValues.sections?.sectionFour?.items ||
          BASE_DEFAULT_VALUES.sections.sectionFour.items,
      },
      sectionFive: {
        ...BASE_DEFAULT_VALUES.sections.sectionFive,
        ...(initialValues.sections?.sectionFive || {}),
      },
      sectionSix: {
        ...BASE_DEFAULT_VALUES.sections.sectionSix,
        ...(initialValues.sections?.sectionSix || {}),
        items:
          initialValues.sections?.sectionSix?.items ||
          BASE_DEFAULT_VALUES.sections.sectionSix.items,
      },
      sectionSeven: {
        ...BASE_DEFAULT_VALUES.sections.sectionSeven,
        ...(initialValues.sections?.sectionSeven || {}),
        items:
          initialValues.sections?.sectionSeven?.items ||
          BASE_DEFAULT_VALUES.sections.sectionSeven.items,
      },
      sectionEight: {
        ...BASE_DEFAULT_VALUES.sections.sectionEight,
        ...(initialValues.sections?.sectionEight || {}),
      },
    },
  };
};
