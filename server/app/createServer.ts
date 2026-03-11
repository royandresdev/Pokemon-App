const express = require("express");
const cors = require("cors");

const { createApiRouter } = require("../routes/apiRouter") as {
  createApiRouter: () => unknown;
};

function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(createApiRouter());

  return app;
}

module.exports = {
  createServer,
};
