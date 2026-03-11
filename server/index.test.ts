type AppServer = {
  listen: (
    port: number,
    callback?: () => void,
  ) => {
    close: (callback?: () => void) => void;
    address: () => { port: number } | string | null;
  };
};

async function withServer(
  fn: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const { createServer } = require("./index") as {
    createServer: () => AppServer;
  };

  const server = createServer().listen(0);
  const address = server.address();

  if (!address || typeof address === "string") {
    server.close();
    throw new Error("No se pudo obtener un puerto para el test");
  }

  try {
    await fn(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe("creación del servidor", () => {
  it("expone una función para crear el servidor", () => {
    const serverModule = require("./index") as {
      createServer?: unknown;
    };

    expect(serverModule.createServer).toEqual(expect.any(Function));
  });

  it("createServer devuelve una app express", () => {
    const { createServer } = require("./index") as {
      createServer: () => {
        use?: unknown;
        post?: unknown;
        listen?: unknown;
      };
    };

    const app = createServer();

    expect(app.use).toEqual(expect.any(Function));
    expect(app.post).toEqual(expect.any(Function));
    expect(app.listen).toEqual(expect.any(Function));
  });
});

describe("CORS", () => {
  it("permite solicitudes desde cualquier origen", async () => {
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
});

describe("endpoint login", () => {
  it("rechaza con 400 si el body contiene campos no permitidos", async () => {
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

  it("rechaza con 400 si el body está vacío o no es un objeto", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([]),
      });

      expect(response.status).toBe(400);
    });
  });

  it("expone la ruta POST /login", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).not.toBe(404);
    });
  });
});

describe("endpoint /pokemons", () => {
  it("expone la ruta GET /pokemons", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons`);

      expect(response.status).not.toBe(404);
    });
  });

  it("devuelve un array de pokemons", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons`);
      const body = (await response.json()) as unknown;

      expect(Array.isArray(body)).toBe(true);
    });
  });

  it("cada pokemon tiene id, name y url", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons`);
      const pokemons = (await response.json()) as Array<{
        id: number;
        name: string;
        url: string;
      }>;

      expect(pokemons.length).toBeGreaterThan(0);
      pokemons.forEach((pokemon) => {
        expect(typeof pokemon.id).toBe("number");
        expect(typeof pokemon.name).toBe("string");
        expect(typeof pokemon.url).toBe("string");
      });
    });
  });
});
