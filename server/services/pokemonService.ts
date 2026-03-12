import type interfaces = require("../../shared/interfaces");
import type { SortBy } from "../../shared/interfaces";

const { getEnvConfig } = require("../config/env") as {
  getEnvConfig: () => {
    port: number;
    pokeApiUrl: string;
    pokeApiSpriteUrl: string;
    apiPublicBaseUrl: string;
  };
};

let pokemonCatalogInCache: interfaces.PokemonListItem[] | null = null;

function getPokemonIdFromUrl(url: string): string {
  const segments = url.split("/").filter(Boolean);
  const pokemonId = segments.at(-1);

  if (!pokemonId) {
    throw new Error("No se pudo obtener el id del pokemon desde la url");
  }

  return pokemonId;
}

function mapNextToLocalApi(
  nextUrl: string | null,
  apiPublicBaseUrl: string,
): string | null {
  if (!nextUrl) {
    return null;
  }

  const next = new URL(nextUrl);
  const limit = next.searchParams.get("limit") ?? "20";
  const offset = next.searchParams.get("offset") ?? "0";

  return `${apiPublicBaseUrl}/pokemons?limit=${limit}&offset=${offset}`;
}

async function getPokemonList(
  limit: number = 20,
  offset: number = 0,
  sortBy: SortBy = "number",
): Promise<interfaces.PokemonListResponse> {
  const { apiPublicBaseUrl } = getEnvConfig();

  if (!pokemonCatalogInCache) {
    pokemonCatalogInCache = await getPokemonCatalog();
  }

  const baseUrl = `${apiPublicBaseUrl}/pokemons`;

  return paginatePokemonCatalog(
    pokemonCatalogInCache,
    limit,
    offset,
    baseUrl,
    sortBy,
  );
}

async function getPokemonCatalog(): Promise<interfaces.PokemonListItem[]> {
  const { pokeApiUrl, pokeApiSpriteUrl } = getEnvConfig();
  const response = await fetch(`${pokeApiUrl}?limit=2000&offset=0`);

  if (!response.ok) {
    throw new Error("Error al obtener el catalogo de pokemons");
  }

  const payload = (await response.json()) as interfaces.PokemonListResponse;

  const results = payload.results.map((pokemon) => ({
    ...pokemon,
    sprite: `${pokeApiSpriteUrl}/${getPokemonIdFromUrl(pokemon.url)}.png`,
  }));

  return results;
}

function paginatePokemonCatalog(
  catalog: interfaces.PokemonListItem[],
  limit: number,
  offset: number,
  baseUrl: string,
  sortBy: SortBy = "number",
): interfaces.PokemonListResponse {
  const count = catalog.length;

  const safeLimit = limit > 0 ? Math.floor(limit) : count;
  const safeOffset = offset >= 0 ? Math.floor(offset) : 0;

  // Copia de los resultados para no modificar el catálogo original
  let sortedResults = [...catalog];

  if (sortBy === "alphabetical") {
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
      ? `${baseUrl}?limit=${safeLimit}&offset=${safeOffset + safeLimit}${sortBy === "alphabetical" ? "&sortBy=alphabetical" : ""}`
      : null;

  const previous =
    safeOffset > 0
      ? `${baseUrl}?limit=${safeLimit}&offset=${Math.max(0, safeOffset - safeLimit)}${sortBy === "alphabetical" ? "&sortBy=alphabetical" : ""}`
      : null;

  return {
    count: count,
    next,
    previous,
    results,
  };
}

async function searchPokemons(
  name: string = "",
  limit: number = 20,
  offset: number = 0,
  sortBy: SortBy = "number",
): Promise<interfaces.PokemonListResponse> {
  if (!pokemonCatalogInCache) {
    pokemonCatalogInCache = await getPokemonCatalog();
  }

  const filteredResults = pokemonCatalogInCache.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(name.toLowerCase()),
  );

  const { apiPublicBaseUrl } = getEnvConfig();
  const baseUrl = `${apiPublicBaseUrl}/pokemons/search?name=${encodeURIComponent(name)}`;
  const paginatedResults = paginatePokemonCatalog(
    filteredResults,
    limit,
    offset,
    baseUrl,
    sortBy,
  );

  return {
    count: filteredResults.length,
    next: paginatedResults.next,
    previous: paginatedResults.previous,
    results: paginatedResults.results,
  };
}

async function getPokemonById(id: string): Promise<interfaces.Pokemon> {
  const { pokeApiUrl } = getEnvConfig();
  const response = await fetch(`${pokeApiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener el pokemon");
  }

  const payload = (await response.json()) as interfaces.Pokemon;

  return payload;
}

module.exports = {
  getPokemonList,
  getPokemonCatalog,
  paginatePokemonCatalog,
  getPokemonById,
  searchPokemons,
};
