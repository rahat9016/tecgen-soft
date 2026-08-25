import { getBaseUrl } from "@/src/config/envConfig";
import { authKey } from "@/src/constants/auth/storageKey";
import { getNewAccessToken, logout } from "@/src/services/auth.service";
import { getCookies } from "@/src/utils/local-storage";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// const instance = axios.create({
//   baseURL: typeof window !== "undefined" ? "/api" : getBaseUrl(),
//   withCredentials: true,
// });
const instance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});
instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.timeout = 60000;

// Request interceptor
instance.interceptors.request.use(
  function (config) {
    // <========
    // If the request is a POST request and the data is not FormData,
    // set Content-Type to application/json
    // ========>
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      // Let the browser set the correct multipart boundary
      config.headers["Content-Type"] = "multipart/form-data";
    }

    // Skip adding Authorization header for login endpoint
    if (!config.url?.includes("/auth/login")) {
      const accessToken = getCookies(authKey);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  // ✅ Handle success
  //@ts-expect-error: response type is not always consistent
  function (response) {
    return {
      data: response?.data?.data,
      meta: response?.data?.meta,
    };
  },

  // ❌ Handle errors
  async function (error) {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const errorMessage = error?.response?.data?.message;
      if (errorMessage.includes("jwt expired")) {
        try {
          const response = await getNewAccessToken();
          const newAccessToken = response.data.accessToken;
          Cookies.set("accessToken", newAccessToken);

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }

      // Case: Refresh token expired or missing
      if (errorMessage.includes("jwt expired")) {
        logout();
        return Promise.reject("Session expired. Please login again.");
      }

      // Case: Invalid password
      if (errorMessage.includes("Password is incorrect")) {
        const errorObj = {
          statusCode: error?.response?.data?.statusCode || 500,
          message: error?.response?.data?.message || "Something went wrong",
          errorMessages: error?.response?.data?.message,
        };
        return Promise.reject(errorObj);
      }

      logout();
    }

    // Handle 403
    if (error?.response?.status === 403) {
      toast.error("You do not have permission to access this resource");
      return Promise.reject(error);
    }

    // Generic Error Handler
    const errorObj = {
      statusCode: error?.response?.data?.statusCode || 500,
      message: error?.response?.data?.message || "Something went wrong",
      errorMessages: error?.response?.data?.message,
      errors: error?.response?.data?.errors,
    };

    return Promise.reject(errorObj);
  }
);
export { instance as axiosInstance };
