import { StatusType } from "@/src/types/common/common";

export interface ICorporate {
  id: string;
  name: string;
  url: string;
  description: string;
  imageUrl: string;
  status: StatusType.ACTIVE | StatusType.INACTIVE;
  createdAt: string;
  updatedAt: string;
}
