const { getEnvConfig, loadEnvironment } = require("./config/env") as {
  getEnvConfig: () => { port: number };
  loadEnvironment: () => void;
};
const { createServer } = require("./app/createServer") as {
  createServer: () => {
    listen: (port: number, callback?: () => void) => unknown;
  };
};

loadEnvironment();

module.exports = {
  createServer,
};

if (require.main === module) {
  const { port } = getEnvConfig();
  const app = createServer();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
