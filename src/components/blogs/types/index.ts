import { StatusType } from "@/src/types/common/common";

export interface IBlog {
  id: string;
  title: string;
  description: string;
  status: StatusType.ACTIVE | StatusType.INACTIVE;
  image: string;
  createdAt: string;
  actions?: string;
}
