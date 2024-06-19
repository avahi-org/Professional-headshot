import Cookies from "js-cookie";

const USER_ID_COOKIE = "userId";
const COOKIE_EXPIRATION_DAYS = 365; // Set cookie expiration to 1 year

export const setUserId = (userId) => {
  Cookies.set(USER_ID_COOKIE, userId, { expires: COOKIE_EXPIRATION_DAYS });
};

export const getUserId = () => {
  return Cookies.get(USER_ID_COOKIE);
};
