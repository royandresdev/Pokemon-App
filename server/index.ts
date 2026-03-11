const { createServer } = require("./app/createServer") as {
  createServer: () => {
    listen: (port: number, callback?: () => void) => unknown;
  };
};

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
