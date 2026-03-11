import { createBrowserRouter, redirect, type RouteObject } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import { isAuthenticated } from "./auth/session";
import HomePage from "./home/HomePage";

export const protectedLoader = () => {
  if (!isAuthenticated()) {
    throw redirect("/login");
  }

  return null;
};

export const publicOnlyLoader = () => {
  if (isAuthenticated()) {
    throw redirect("/");
  }

  return null;
};

export const appRoutes: RouteObject[] = [
  {
    path: "/login",
    loader: publicOnlyLoader,
    hydrateFallbackElement: <div />,
    element: <LoginPage />,
  },
  {
    path: "/",
    loader: protectedLoader,
    hydrateFallbackElement: <div />,
    element: <HomePage />,
  },
];

export const appRouter = createBrowserRouter(appRoutes);
