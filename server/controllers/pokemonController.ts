import type { SortBy } from "../../shared/interfaces/index.js";
import {
  getPokemonList,
  getPokemonById,
  searchPokemons,
} from "../services/pokemonService.js";

type AppResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

type ListPokemonsRequest = {
  query?: {
    name?: string;
    limit?: string;
    offset?: string;
    sortby?: SortBy;
  };
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

export async function listPokemonsController(
  request: ListPokemonsRequest,
  response: AppResponse,
) {
  const pokemonList = await getPokemonList(request.query || {});

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

async function searchPokemonsController(
  request: ListPokemonsRequest,
  response: AppResponse,
) {
  const result = await searchPokemons(request.query || {});

  return response.status(200).json(result);
}

module.exports = {
  listPokemonsController,
  getPokemonByIdController,
  searchPokemonsController,
};
