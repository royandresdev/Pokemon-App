import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "./HomePage";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("HomePage", () => {
  it("muestra un input de búsqueda y permite escribir", async () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText("Buscar pokémon...");
    expect(input).toBeInTheDocument();
    input.focus();
    await screen.findByPlaceholderText("Buscar pokémon...");
  });
  it("obtiene los pokemons del endpoint y los muestra en pantalla", async () => {
    vi.stubEnv("VITE_API_URL", "http://test-api");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 1350,
        next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
        previous: null,
        results: [
          {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon/1/",
            sprite: "https://example.com/sprites/1.png",
          },
          {
            name: "ivysaur",
            url: "https://pokeapi.co/api/v2/pokemon/2/",
            sprite: "https://example.com/sprites/2.png",
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<HomePage />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://test-api/pokemons");
    });

    expect(await screen.findByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("ivysaur")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Sprite de bulbasaur" })).toBeInTheDocument();
  });

  it("hace fetch del next al entrar el sentinel en viewport y agrega nuevos pokemons", async () => {
    vi.stubEnv("VITE_API_URL", "http://test-api");

    class IntersectionObserverMock {
      static callback: IntersectionObserverCallback | null = null;

      constructor(callback: IntersectionObserverCallback) {
        IntersectionObserverMock.callback = callback;
      }

      observe() {
        return undefined;
      }

      unobserve() {
        return undefined;
      }

      disconnect() {
        return undefined;
      }
    }

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          count: 1350,
          next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
          previous: null,
          results: [
            {
              name: "bulbasaur",
              url: "https://pokeapi.co/api/v2/pokemon/1/",
              sprite: "https://example.com/sprites/1.png",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          count: 1350,
          next: null,
          previous: "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20",
          results: [
            {
              name: "ivysaur",
              url: "https://pokeapi.co/api/v2/pokemon/2/",
              sprite: "https://example.com/sprites/2.png",
            },
          ],
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<HomePage />);

    expect(await screen.findByText("bulbasaur")).toBeInTheDocument();

    expect(IntersectionObserverMock.callback).not.toBeNull();

    if (!IntersectionObserverMock.callback) {
      throw new Error("No se registró callback de IntersectionObserver");
    }

    IntersectionObserverMock.callback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
      );
    });

    expect(await screen.findByText("ivysaur")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Sprite de ivysaur" })).toBeInTheDocument();
  });
});
