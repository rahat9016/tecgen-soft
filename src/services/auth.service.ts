import axios from "axios";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";
import { removeAuthCookies } from "../actions/cookiesAction";
import { getBaseUrl } from "../config/envConfig";
import { authKey } from "../constants/auth/storageKey";
import { getFromLocalStorage, setToLocalStorage } from "../utils/local-storage";
import { decodedToken } from "./jwt";

export const storeUserInfo = ({ accessToken }: { accessToken: string }) => {
  return setToLocalStorage(authKey, accessToken as string);
};

export const getUserInfo = () => {
  const authToken = getFromLocalStorage(authKey);
  // console.log(authToken);
  if (authToken) {
    const decodedData = decodedToken(authToken);
    return decodedData;
  } else {
    return "";
  }
};

export const isLoggedIn = () => {
  const authToken = getFromLocalStorage(authKey);
  return !!authToken;
};

export const removeUserInfo = (key: string) => {
  return localStorage.removeItem(key);
};

export async function logout() {
  // Remove all auth cookies (httpOnly + regular) via server action
  await removeAuthCookies();

  // Remove user-specific information from localStorage
  removeUserInfo("accessToken");

  // Redirect to the home page
  redirect("/");
}

export const getNewAccessToken = async () => {
  const refreshToken = Cookies.get("refreshToken");
  console.log("refreshToken", refreshToken);
  if (!refreshToken) {
    throw new Error("Refresh token expired");
  }

  const response = await axios.post(
    `${getBaseUrl()}/auth/refresh-token`,
    {
      refreshToken: refreshToken,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
