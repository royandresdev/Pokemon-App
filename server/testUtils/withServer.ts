import { createServer } from "../index.js";

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

export { withServer };
