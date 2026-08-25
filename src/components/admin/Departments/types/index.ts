import { StatusType } from "@/src/types/common/common";

export interface IDepartment {
  id: string;
  name: string;
  description?: string;
  status: StatusType;
  _count?: {
    doctors: number;
  };
  actions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDepartmentList extends IDepartment {
  createdAt: string;
  updatedAt: string;
}
