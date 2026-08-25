import Cookies from "js-cookie";

/**
 * Get token from cookies by name
 * @param token_name string
 * @returns string | undefined
 */
export const getToken = (token_name: string): string | undefined => {
  return Cookies.get(token_name);
};
