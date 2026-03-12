import type interfaces = require("../../shared/interfaces");

type AppResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

type ListPokemonsRequest = {
  query?: {
    limit?: string;
    offset?: string;
    sortBy?: "number" | "alphabetical";
  };
};

const { getPokemonList, getPokemonById } =
  require("../services/pokemonService") as {
    getPokemonList: (
      limit?: number,
      offset?: number,
      sortBy?: "number" | "alphabetical",
    ) => Promise<interfaces.PokemonListResponse>;
    getPokemonById: (id: string) => Promise<interfaces.Pokemon>;
  };

function parsePaginationNumber(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return Math.floor(parsedValue);
}

async function listPokemonsController(
  request: ListPokemonsRequest,
  response: AppResponse,
) {
  const limit = parsePaginationNumber(request.query?.limit, 20);
  const offset = parsePaginationNumber(request.query?.offset, 0);
  const sortBy =
    request.query?.sortBy === "alphabetical" ? "alphabetical" : "number";
  const pokemonList = await getPokemonList(limit, offset, sortBy);

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
