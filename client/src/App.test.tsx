import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { appRoutes } from "./router";

const pokemonListResponse = {
  count: 1350,
  next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
  previous: null,
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
    },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
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
    vi.stubEnv("VITE_API_URL", "http://test-api");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => pokemonListResponse,
    }));

    localStorage.setItem("auth_user", "admin");

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/"],
    });

    render(
      <RouterProvider router={router} />,
    );

    expect(await screen.findByText("Pokédex")).toBeInTheDocument();
  });

  it("redirige a / si el usuario ya está autenticado y accede a /login", async () => {
    vi.stubEnv("VITE_API_URL", "http://test-api");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => pokemonListResponse,
    }));

    localStorage.setItem("auth_user", "admin");

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/login"],
    });

    render(
      <RouterProvider router={router} />,
    );

    expect(await screen.findByText("Pokédex")).toBeInTheDocument();
  });
});
