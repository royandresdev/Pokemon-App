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
    const { createServer } = require("./index") as {
      createServer: () => {
        listen: (
          port: number,
          callback?: () => void,
        ) => {
          close: (callback?: () => void) => void;
          address: () => { port: number } | string | null;
        };
      };
    };

    const app = createServer();
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === "string") {
      server.close();
      throw new Error("No se pudo obtener un puerto para el test");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173",
      },
      body: JSON.stringify({}),
    });

    await new Promise<void>((resolve) => server.close(() => resolve()));

    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });
});

describe("endpoint login", () => {
  it("expone la ruta POST /login", async () => {
    const { createServer } = require("./index") as {
      createServer: () => {
        listen: (
          port: number,
          callback?: () => void,
        ) => {
          close: (callback?: () => void) => void;
          address: () => { port: number } | string | null;
        };
      };
    };

    const app = createServer();
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === "string") {
      server.close();
      throw new Error("No se pudo obtener un puerto para el test");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    await new Promise<void>((resolve) => server.close(() => resolve()));

    expect(response.status).not.toBe(404);
  });
});
