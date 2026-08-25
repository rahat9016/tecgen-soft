import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { setUserId } from "../lib/redux/features/auth/authSlice";
import { useAppDispatch } from "../lib/redux/hooks";
import { authService } from "../services/auth";
import { IGenericErrorResponse } from "../types/common/common";

interface JwtPayload {
  role?: string;
  id?: string;
  userId?: string;
  sub?: string;
}

export const useAuth = (onSuccess?: (role: string) => void) => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      console.log(data);
      // Set accessToken & refreshToken as cookies
      Cookies.set("accessToken", data.accessToken, { expires: 1 });
      Cookies.set("refreshToken", data.refreshToken, { expires: 2 });

      // Decode role from JWT
      let role = "user";
      try {
        const decoded = jwtDecode<JwtPayload>(data.accessToken);
        role = decoded.role || "user";
        const userId = String(
          decoded.id || decoded.userId || decoded.sub || ""
        );

        if (userId) {
          dispatch(setUserId(userId));
        }
      } catch {
        console.error("Failed to decode JWT");
      }

      toast.success(data.message || "Login successful");
      if (onSuccess) {
        onSuccess(role);
      }
    },
    onError: (error: IGenericErrorResponse) => {
      toast.error(error.message);
      throw error;
    },
  });
};
