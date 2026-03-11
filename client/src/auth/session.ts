export const AUTH_USER_KEY = "auth_user";

export const getAuthUser = () => localStorage.getItem(AUTH_USER_KEY);

export const isAuthenticated = () => getAuthUser() !== null;
