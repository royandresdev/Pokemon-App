import { loadEnvironment, getEnvConfig } from "./config/env.js";
import { createServer } from "./app/createServer.js";

loadEnvironment();

if (require.main === module) {
  const { port } = getEnvConfig();
  const app = createServer();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export {createServer}
