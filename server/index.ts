const express = require("express");
const cors = require("cors");

type LoginRequest = {
  body?: unknown;
};

const ALLOWED_FIELDS = new Set(["username", "password"]);

type LoginResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.post("/login", (request: LoginRequest, response: LoginResponse) => {
    const body = request.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body) ||
      Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))
    ) {
      return response
        .status(400)
        .json({ message: "Campos no permitidos en la solicitud" });
    }

    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    if (username === "admin" && password === "admin") {
      return response.status(200).json({ ok: true });
    }

    return response.status(401).json({ message: "Credenciales inválidas" });
  });

  return app;
}

module.exports = {
  createServer,
};

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  const app = createServer();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
