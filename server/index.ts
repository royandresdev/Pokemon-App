const express = require("express");
const cors = require("cors");

type LoginRequest = {
  body?: {
    username?: string;
    password?: string;
  };
};

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
    const { username, password } = request.body ?? {};

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
