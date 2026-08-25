import { StatusType } from "@/src/types/common/common";

export interface IAboutItem {
  id: number;
  icon: string;
  title: string;
  text: string;
  active?: boolean;
}

export type IPurpose = {
  title: string;
  description: string;
  image: string;
};

export type IVideo = {
  title: string;
  description: string;
  thumbnail?: string;
  videoThumbnail?: string;
  status: StatusType | string | boolean;
  url?: string;
  link?: string;
};
export type IGalleryImage = {
  imageUrl: string;
  status: string;
};
