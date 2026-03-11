type AppResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

const { getPokemonList } = require("../services/pokemonService") as {
  getPokemonList: () => unknown;
};

function listPokemonsController(_request: unknown, response: AppResponse) {
  return response.status(200).json(getPokemonList());
}

module.exports = {
  listPokemonsController,
};
