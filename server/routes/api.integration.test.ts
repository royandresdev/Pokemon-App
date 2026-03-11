import type interfaces = require("../../shared/interfaces");

const { withServer } = require("../testUtils/withServer") as {
  withServer: (fn: (baseUrl: string) => Promise<void>) => Promise<void>;
};

const realFetch = global.fetch;

const pokemonListResponseMock: interfaces.PokemonListResponse = {
  count: "1350",
  next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
  previous: null,
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
    },
  ],
};

describe("API integration", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.includes("pokeapi.co/api/v2/pokemon")) {
        return new Response(JSON.stringify(pokemonListResponseMock), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      return realFetch(input, init);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("permite solicitudes CORS desde cualquier origen", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({}),
      });

      expect(response.headers.get("access-control-allow-origin")).toBe("*");
    });
  });

  it("expone POST /login", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).not.toBe(404);
    });
  });

  it("rechaza campos no permitidos en /login", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "admin",
          role: "superadmin",
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  it("expone GET /pokemons", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons`);

      expect(response.status).not.toBe(404);
    });
  });

  it("devuelve la lista de pokemons en /pokemons", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons`);

      expect(response.ok).toBe(true);
      const body = (await response.json()) as interfaces.PokemonListResponse;

      expect(Array.isArray(body.results)).toBe(true);
      expect(body.results.length).toBeGreaterThan(0);
    });
  });
});
