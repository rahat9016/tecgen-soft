import { StatusType } from "@/src/types/common/common";

export interface IMediaImage {
  id: string;
  imageUrl: string;
  updatedAt: string;
  status: string;
  createdAt: string;
  actions?: string;
}

export interface IMediaVideo {
  videoThumbnail: string;
  thumbnail?: string;
  id: string;
  title: string;
  link: string;
  url: string;
  duration: string;
  status: StatusType | string;
  description: string;
  updatedAt: string;
  createdAt: string;
  actions?: string;
}
