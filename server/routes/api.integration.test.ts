import type interfaces = require("../../shared/interfaces");

const { withServer } = require("../testUtils/withServer") as {
  withServer: (fn: (baseUrl: string) => Promise<void>) => Promise<void>;
};

describe("API integration", () => {
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
      const body = (await response.json()) as interfaces.PokemonListResponse;

      expect(Array.isArray(body.results)).toBe(true);
      expect(body.results.length).toBeGreaterThan(0);
    });
  });
});
