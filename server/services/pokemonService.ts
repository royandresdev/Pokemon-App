import type {
  Pokemon,
  PokemonListItem,
  PokemonListResponse,
} from "../../shared/interfaces/index.js";
import type { QueryParams } from "../../shared/interfaces/index.js";
import { getEnvConfig } from "../config/env.js";

let pokemonCatalogInCache: PokemonListItem[] | null = null;

function getPokemonIdFromUrl(url: string): string {
  const segments = url.split("/").filter(Boolean);
  const pokemonId = segments.at(-1);

  if (!pokemonId) {
    throw new Error("No se pudo obtener el id del pokemon desde la url");
  }

  return pokemonId;
}

async function getPokemonList(
  queryParams: QueryParams,
): Promise<PokemonListResponse> {
  const { apiPublicBaseUrl } = getEnvConfig();

  if (!pokemonCatalogInCache) {
    pokemonCatalogInCache = await getPokemonCatalog();
  }

  const baseUrl = `${apiPublicBaseUrl}/pokemons`;

  return paginatePokemonCatalog(pokemonCatalogInCache, baseUrl, queryParams);
}

async function getPokemonCatalog(): Promise<PokemonListItem[]> {
  const { pokeApiUrl, pokeApiSpriteUrl } = getEnvConfig();
  const response = await fetch(`${pokeApiUrl}?limit=2000&offset=0`);

  if (!response.ok) {
    throw new Error("Error al obtener el catalogo de pokemons");
  }

  const payload = (await response.json()) as PokemonListResponse;

  const results = payload.results.map((pokemon) => ({
    ...pokemon,
    sprite: `${pokeApiSpriteUrl}/${getPokemonIdFromUrl(pokemon.url)}.gif`,
  }));

  return results;
}

const appendQueryParamsToUrl = (url: string, query: QueryParams): string => {
  const urlObj = new URL(url);

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      urlObj.searchParams.set(key, value);
    }
  }

  return urlObj.toString();
};

function paginatePokemonCatalog(
  catalog: PokemonListItem[],
  baseUrl: string,
  queryParams: QueryParams,
): PokemonListResponse {
  const count = catalog.length;

  const {
    limit = "20",
    offset = "0",
    sortby = "number",
    name = "",
  } = queryParams;

  const safeLimit = Number(limit) > 0 ? Math.floor(Number(limit)) : count;
  const safeOffset = Number(offset) >= 0 ? Math.floor(Number(offset)) : 0;

  // Copia de los resultados para no modificar el catálogo original
  let sortedResults = [...catalog];

  if (sortby === "alphabetical") {
    sortedResults.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sortedResults.sort((a, b) => {
      const idA = Number(getPokemonIdFromUrl(a.url));
      const idB = Number(getPokemonIdFromUrl(b.url));
      return idA - idB;
    });
  }

  const results = sortedResults.slice(safeOffset, safeOffset + safeLimit);

  const next =
    safeOffset + safeLimit < count
      ? appendQueryParamsToUrl(baseUrl, {
          limit: String(safeLimit),
          offset: String(safeOffset + safeLimit),
          sortby,
          name,
        })
      : null;

  const previous =
    safeOffset > 0
      ? appendQueryParamsToUrl(baseUrl, {
          limit: String(safeLimit),
          offset: String(Math.max(safeOffset - safeLimit, 0)),
          sortby,
          name,
        })
      : null;

  return {
    count: count,
    next,
    previous,
    results,
  };
}

async function searchPokemons(
  queryParams: QueryParams,
): Promise<PokemonListResponse> {
  const { name = "" } = queryParams;

  if (!pokemonCatalogInCache) {
    pokemonCatalogInCache = await getPokemonCatalog();
  }

  const filteredResults = pokemonCatalogInCache.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(name.toLowerCase()),
  );

  const { apiPublicBaseUrl } = getEnvConfig();
  const baseUrl = `${apiPublicBaseUrl}/pokemons/search`;
  const paginatedResults = paginatePokemonCatalog(
    filteredResults,
    baseUrl,
    queryParams,
  );

  return {
    count: filteredResults.length,
    next: paginatedResults.next,
    previous: paginatedResults.previous,
    results: paginatedResults.results,
  };
}

async function getPokemonById(id: string): Promise<Pokemon> {
  const { pokeApiUrl } = getEnvConfig();
  const response = await fetch(`${pokeApiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener el pokemon");
  }

  const payload = (await response.json()) as Pokemon;

  return payload;
}

export {
  getPokemonList,
  getPokemonById,
  searchPokemons,
  paginatePokemonCatalog,
  getPokemonCatalog,
};
