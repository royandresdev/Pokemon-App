import { loadEnvironment, getEnvConfig } from "./config/env.js";
import { createServer } from "./app/createServer.js";
import { fileURLToPath } from "url";

loadEnvironment();

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const { port } = getEnvConfig();
  const app = createServer();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export { createServer };
