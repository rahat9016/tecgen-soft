"use client";
import Cookies from "js-cookie";

import { useEffect, useMemo } from "react";
import { useGet } from "../hooks/useGet";
import { setUserInformation } from "../lib/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../lib/redux/hooks";
import { decodedToken } from "../services/jwt";

export const UserFetcher = () => {
  const dispatch = useAppDispatch();
  const storedUserId = useAppSelector((state) => state.auth.userInformation.id);
  const accessToken = Cookies.get("accessToken");

  // Prefer the reactive store value, but fall back to the cookie on reload.
  const decodedUserId = useMemo(() => {
    if (storedUserId) return storedUserId;

    if (!accessToken) return "";
    try {
      const decoded = decodedToken(accessToken) as {
        id?: string;
        userId?: string;
        sub?: string;
      };
      return String(decoded.id || decoded.userId || decoded.sub || "");
    } catch {
      return "";
    }
  }, [accessToken, storedUserId]);

  const { data, isSuccess, isLoading } = useGet(
    `/user/${decodedUserId}`,
    ["user", decodedUserId || ""],
    undefined,
    {
      enabled: !!decodedUserId,
      staleTime: 5 * 60 * 1000,
    }
  );

  // If user data is available, set it in the store
  useEffect(() => {
    if (isSuccess && data?.data) {
      dispatch(setUserInformation(data.data));
    }
  }, [isSuccess, data, dispatch, isLoading]);

  return null;
};
