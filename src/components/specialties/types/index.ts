export interface ISpecialtyListItem {
  id?: string;
  title: string;
  description: string;
}

export type SpecialtyStatus = "ACTIVE" | "INACTIVE";

export type SpecialtySectionType =
  | "TEXT"
  | "TEXT_WITH_IMAGE"
  | "TEXT_WITH_LIST"
  | "IMAGE"
  | "LIST";

export interface ISpecialtyDoctor {
  id: string;
  fullName: string;
  image: string;
  doctorId: string;
  status: SpecialtyStatus;
  contactNumber: string;
  email: string;
  designation: string;
  department: {
    name: string;
  };
}

export interface ISpecialtyDoctorSection {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  specialityId: string;
  status: SpecialtyStatus;
  order: number;
  doctor: ISpecialtyDoctor[];
}

export interface ISpecialtySectionImage {
  id: string;
  imageUrl: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  sectionId: string;
}

export interface ISpecialtySectionItem {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  sectionId: string;
  status: SpecialtyStatus;
}

export interface ISpecialtySection {
  id: string;
  title: string;
  description: string | null;
  status: SpecialtyStatus;
  createdAt: string;
  updatedAt: string;
  order: number;
  type: SpecialtySectionType;
  sectionImages: ISpecialtySectionImage[];
  sectionItems: ISpecialtySectionItem[];
}

export interface ISpecialtyDetail {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  status: SpecialtyStatus;
  createdAt: string;
  updatedAt: string;
  doctorSections: ISpecialtyDoctorSection[];
  sections: ISpecialtySection[];
}
