import express from "express";
import cors from "cors";
import { createApiRouter } from "../routes/apiRouter.js";

function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(createApiRouter());

  return app;
}

export { createServer };
