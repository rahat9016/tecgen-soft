export interface IApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export type ApiResponse<T = unknown> = {
  data: T;
  message: string;
};

export type ApiError = {
  message: string;
};
