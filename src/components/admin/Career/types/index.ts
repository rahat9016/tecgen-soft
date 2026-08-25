export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  TEMPORARY = "TEMPORARY",
  INTERN = "INTERN",
  VOLUNTEER = "VOLUNTEER",
}

export interface ICareer {
  id: string;
  image: string;
  title: string;
  salary: string | number;
  description: string;
  vacancy: number;
  location: string;
  deadline: string;
  status: boolean | string;
  experience: string | number;
  jobType?: JobType | string;
  createdAt: string;
  actions?: string;
  currency: string;
  isActive: boolean;
}

export interface IApplicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  career: ICareer;
  resumeUrl: string;
  createdAt: string;
  action?: string;
  resume?: string;
}
