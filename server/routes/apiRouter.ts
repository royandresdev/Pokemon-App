import express from "express";
import { loginController } from "../controllers/loginController.js";

import {
  listPokemonsController,
  searchPokemonsController,
  getPokemonByIdController,
} from "../controllers/pokemonController.js";

function createApiRouter() {
  const router = express.Router();

  router.post("/login", loginController);
  router.get("/pokemons", listPokemonsController);
  router.get("/pokemons/search", searchPokemonsController);
  router.get("/pokemons/:id", getPokemonByIdController);

  return router;
}

export { createApiRouter };
