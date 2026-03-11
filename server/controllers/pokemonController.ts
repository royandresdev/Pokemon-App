import type interfaces = require("../../shared/interfaces");

type AppResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

const { getPokemonList, getPokemonById } =
  require("../services/pokemonService") as {
    getPokemonList: () => Promise<interfaces.PokemonListResponse>;
    getPokemonById: (id: string) => Promise<interfaces.Pokemon>;
  };

async function listPokemonsController(
  _request: unknown,
  response: AppResponse,
) {
  const pokemonList = await getPokemonList();

  return response.status(200).json(pokemonList);
}

async function getPokemonByIdController(
  request: { params: { id: string } },
  response: AppResponse,
) {
  const { id } = request.params;
  const pokemon = await getPokemonById(id);

  return response.status(200).json(pokemon);
}

module.exports = {
  listPokemonsController,
  getPokemonByIdController,
};
