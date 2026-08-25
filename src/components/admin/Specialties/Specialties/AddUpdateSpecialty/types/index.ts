export type DayName =
  | "Saturday"
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export type StatusValue = "ACTIVE" | "INACTIVE";

export enum SectionType {
  TEXT = "TEXT",
  TEXT_WITH_IMAGE = "TEXT_WITH_IMAGE",
  TEXT_WITH_LIST = "TEXT_WITH_LIST",
  IMAGE = "IMAGE",
  LIST = "LIST",
}

export type ISectionImageInput = {
  imageUrl: File | string | null;
  position: number;
};

export type ISelectedDoctor = {
  id: string;
  doctorId: string;
  fullName: string;
  image: string;
  status: StatusValue;
  department: {
    id: string;
    name: string;
  };
};

export type ISpecialtyFormType = {
  hero: {
    title: string;
    description: string;
    coverImage: File | string | null;
    status: StatusValue;
  };
  doctorSection: {
    title: string;
    order: number;
    isActive: boolean;
    doctors: ISelectedDoctor[];
  };
  sections: {
    sectionOne: {
      title: string;
      description: string;
      order: number;
      isActive: boolean;
    };
    sectionTwo: {
      title: string;
      description: string;
      coverImage: File | string | null;
      images: ISectionImageInput[];
      order: number;
      isActive: boolean;
    };
    sectionThree: {
      title: string;
      order: number;
      isActive: boolean;
      items: ISectionItem[];
    };
    sectionFour: {
      title: string;
      order: number;
      isActive: boolean;
      items: ISectionItem[];
    };
    sectionFive: {
      title: string;
      description: string;
      order: number;
      isActive: boolean;
    };
    sectionSix: {
      title: string;
      order: number;
      isActive: boolean;
      items: ISectionItem[];
    };
    sectionSeven: {
      title: string;
      description: string;
      order: number;
      isActive: boolean;
      items: ISectionItem[];
    };
    sectionEight: {
      title: string;
      description: string;
      order: number;
      isActive: boolean;
    };
  };
};

export type ISpecialtySubmitPayload = {
  hero: ISpecialtyFormType["hero"];
  doctorSection: {
    title: string;
    order: number;
    status: StatusValue;
    doctorIds: Array<{ id: string; doctorId: string; status: StatusValue }>;
  };
  sections: Array<
    | (Omit<ISpecialtyFormType["sections"]["sectionOne"], "isActive"> & {
        type: SectionType.TEXT;
        status: StatusValue;
      })
    | (Omit<
        ISpecialtyFormType["sections"]["sectionTwo"],
        "isActive" | "coverImage"
      > & {
        type: SectionType.TEXT_WITH_IMAGE;
        status: StatusValue;
      })
    | (Omit<ISpecialtyFormType["sections"]["sectionThree"], "isActive"> & {
        type: SectionType.LIST;
        status: StatusValue;
      })
    | (Omit<ISpecialtyFormType["sections"]["sectionFour"], "isActive"> & {
        type: SectionType.LIST;
        status: StatusValue;
      })
    | (Omit<ISpecialtyFormType["sections"]["sectionFive"], "isActive"> & {
        type: SectionType.TEXT;
        status: StatusValue;
      })
    | (Omit<ISpecialtyFormType["sections"]["sectionSix"], "isActive"> & {
        type: SectionType.LIST;
        status: StatusValue;
      })
    | (Omit<ISpecialtyFormType["sections"]["sectionSeven"], "isActive"> & {
        type: SectionType.TEXT_WITH_LIST;
        status: StatusValue;
      })
    | (Omit<ISpecialtyFormType["sections"]["sectionEight"], "isActive"> & {
        type: SectionType.TEXT;
        status: StatusValue;
      })
  >;
};

export interface ISelectOption {
  label: string;
  value: string | boolean | number;
}

export type ISection = {
  title: string;
  status: StatusValue;
  description: string;
  actions?: string;
};

export interface ISectionItem {
  id?: string;
  title: string;
  description?: string;
  status: StatusValue;
  actions?: string;
}
