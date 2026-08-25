import { AxiosRequestConfig } from "axios";
import { axiosInstance } from "../helpers/axios/axiosInstance";

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    // console.log("login function called", credentials);
    const response = await axiosInstance.post("/auth/login", credentials);
    // console.log("response", response);

    return response.data;
  },
};

export const postService = {
  request: async (
    endpoint: string,
    data: FormData | Record<string, unknown>,
    config: AxiosRequestConfig = {}
  ) => {
    // console.log(`Requesting ${endpoint} with data:`, data);
    const response = await axiosInstance.post(endpoint, data, config);
    // console.log("Response:", response);
    return response.data;
  },

  patch: async (
    endpoint: string,
    data: Record<string, unknown> | FormData,
    config: AxiosRequestConfig = {}
  ) => {
    console.log(`PATCH Request to ${endpoint} with data:`, data);
    const response = await axiosInstance.patch(endpoint, data, config);
    // console.log("Response:", response);
    return response.data;
  },
};
export const deleteService = {
  delete: async (endpoint: string) => {
    // console.log(`Requesting ${endpoint}`);
    const response = await axiosInstance.delete(endpoint);
    // console.log("Response:", response);
    return response.data;
  },
};
