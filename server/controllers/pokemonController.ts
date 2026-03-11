type AppResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

const { getPokemonList } = require("../services/pokemonService") as {
  getPokemonList: () => Promise<unknown>;
};

async function listPokemonsController(
  _request: unknown,
  response: AppResponse,
) {
  const pokemonList = await getPokemonList();

  return response.status(200).json(pokemonList);
}

module.exports = {
  listPokemonsController,
};
