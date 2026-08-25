export interface IUserInformation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePicture: string | null;
  isVerified: boolean;
  status: string;
  role: string;
}

export interface IDataItem {
  id: number;
  name: string;
}

export interface IInitialState {
  loading: boolean;
  userInformation: IUserInformation;
  data: unknown[];
  // data: IDataItem[]; // Array of IDataItem objects
}
