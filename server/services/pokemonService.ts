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

let pokemonCatalogCache: interfaces.PokemonListResponse | null = null;

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

  if (!pokemonCatalogCache) {
    pokemonCatalogCache = await getPokemonCatalog();
  }

  return paginatePokemonCatalog(
    pokemonCatalogCache,
    limit,
    offset,
    apiPublicBaseUrl,
    sortBy,
  );
}

async function getPokemonCatalog(): Promise<interfaces.PokemonListResponse> {
  const { pokeApiUrl, pokeApiSpriteUrl, apiPublicBaseUrl } = getEnvConfig();
  const response = await fetch(`${pokeApiUrl}?limit=2000&offset=0`);

  if (!response.ok) {
    throw new Error("Error al obtener el catalogo de pokemons");
  }

  const payload = (await response.json()) as interfaces.PokemonListResponse;

  const results = payload.results.map((pokemon) => ({
    ...pokemon,
    sprite: `${pokeApiSpriteUrl}/${getPokemonIdFromUrl(pokemon.url)}.png`,
  }));

  return {
    ...payload,
    next: mapNextToLocalApi(payload.next, apiPublicBaseUrl),
    results,
  };
}

function paginatePokemonCatalog(
  catalog: interfaces.PokemonListResponse,
  limit: number,
  offset: number,
  apiPublicBaseUrl: string,
  sortBy: SortBy = "number",
): interfaces.PokemonListResponse {
  const totalCountFromCatalog = Number(catalog.count);
  const totalCount = Number.isFinite(totalCountFromCatalog)
    ? totalCountFromCatalog
    : catalog.results.length;

  const safeLimit = limit > 0 ? Math.floor(limit) : catalog.results.length;
  const safeOffset = offset >= 0 ? Math.floor(offset) : 0;

  // Copia de los resultados para no modificar el catálogo original
  let sortedResults = [...catalog.results];

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
    safeOffset + safeLimit < totalCount
      ? `${apiPublicBaseUrl}/pokemons?limit=${safeLimit}&offset=${safeOffset + safeLimit}${sortBy === "alphabetical" ? "&sortBy=alphabetical" : ""}`
      : null;

  const previous =
    safeOffset > 0
      ? `${apiPublicBaseUrl}/pokemons?limit=${safeLimit}&offset=${Math.max(0, safeOffset - safeLimit)}${sortBy === "alphabetical" ? "&sortBy=alphabetical" : ""}`
      : null;

  return {
    count: catalog.count,
    next,
    previous,
    results,
  };
}

async function searchPokemons(name: string) {}

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
