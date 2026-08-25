import Cookies from "js-cookie";
export const setToLocalStorage = (key: string, token: string) => {
  if (!key || typeof window === "undefined") {
    return "";
  }
  return localStorage.setItem(key, token);
};

export const getFromLocalStorage = (key: string) => {
  if (!key || typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(key);
};
export const getCookies = (key: string) => {
  if (!key || typeof window === "undefined") {
    return "";
  }
  return Cookies.get(key);
};
