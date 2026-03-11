import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { appRoutes } from "./router";

afterEach(() => {
  localStorage.clear();
});

describe("Router", () => {
  it("muestra LoginPage al navegar a /login", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/login"],
    });

    render(
      <RouterProvider router={router} />,
    );

    expect(await screen.findByText("Iniciar sesión")).toBeInTheDocument();
  });

  it("redirige a /login si el usuario no está autenticado y accede a /", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/"],
    });

    render(
      <RouterProvider router={router} />,
    );

    expect(await screen.findByText("Iniciar sesión")).toBeInTheDocument();
  });

  it("muestra HomePage si el usuario está autenticado y accede a /", async () => {
    localStorage.setItem("auth_user", "admin");

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/"],
    });

    render(
      <RouterProvider router={router} />,
    );

    expect(await screen.findByText("Pokémon App")).toBeInTheDocument();
  });

  it("redirige a / si el usuario ya está autenticado y accede a /login", async () => {
    localStorage.setItem("auth_user", "admin");

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/login"],
    });

    render(
      <RouterProvider router={router} />,
    );

    expect(await screen.findByText("Pokémon App")).toBeInTheDocument();
  });
});
