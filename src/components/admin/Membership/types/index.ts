import { StatusType } from "@/src/types/common/common";

export enum RelationshipType {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  BROTHER = "BROTHER",
  SISTER = "SISTER",
  OTHER = "OTHER",
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relation: RelationshipType;
}

export interface IGeneralMembership {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  contactNumber: string;
  email: string;
  nationalId?: string;
  bloodGroup?: string;
  address?: string;
  discount: number;
  status: StatusType;
  emergency?: IEmergencyContact;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICorporateMembership {
  id: string;
  companyName: string;
  contactPerson: string;
  contactNumber: string;
  totalEmployees: number;
  industryType?: string | undefined;
  contactPersonDesignation: string;
  address?: string;
  email: string;
  tradeLicense: string;
  discount: number;
  status: StatusType;
  packageId: string;
  employees: ICorporateEmployee[];
  package?: {
    id: string;
    title: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ICorporateEmployee {
  employeeId: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  status: StatusType;
}

export interface IMembershipPackage {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  notices: string[];
  status: StatusType;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMembershipPackageOption {
  id: string;
  title: string;
}
