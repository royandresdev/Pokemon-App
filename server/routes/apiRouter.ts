const express = require("express");

const { loginController } = require("../controllers/loginController") as {
  loginController: (request: unknown, response: unknown) => unknown;
};
const { listPokemonsController } =
  require("../controllers/pokemonController") as {
    listPokemonsController: (request: unknown, response: unknown) => unknown;
  };

function createApiRouter() {
  const router = express.Router();

  router.post("/login", loginController);
  router.get("/pokemons", listPokemonsController);

  return router;
}

module.exports = {
  createApiRouter,
};
