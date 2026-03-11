const express = require("express");

const { loginController } = require("../controllers/loginController") as {
  loginController: (request: unknown, response: unknown) => unknown;
};
const { listPokemonsController, getPokemonByIdController } =
  require("../controllers/pokemonController") as {
    listPokemonsController: (request: unknown, response: unknown) => unknown;
    getPokemonByIdController: (request: unknown, response: unknown) => unknown;
  };

function createApiRouter() {
  const router = express.Router();

  router.post("/login", loginController);
  router.get("/pokemons", listPokemonsController);
  router.get("/pokemons/:id", getPokemonByIdController);

  return router;
}

module.exports = {
  createApiRouter,
};
