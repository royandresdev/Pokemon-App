import type interfaces = require("../../shared/interfaces");

const { getEnvConfig } = require("../config/env") as {
  getEnvConfig: () => { pokeApiUrl: string; pokeApiSpriteUrl: string };
};

function getPokemonIdFromUrl(url: string): string {
  const segments = url.split("/").filter(Boolean);
  const pokemonId = segments.at(-1);

  if (!pokemonId) {
    throw new Error("No se pudo obtener el id del pokemon desde la url");
  }

  return pokemonId;
}

async function getPokemonList(
  limit: number = 20,
  offset: number = 0,
): Promise<interfaces.PokemonListResponse> {
  const { pokeApiUrl, pokeApiSpriteUrl } = getEnvConfig();
  const response = await fetch(`${pokeApiUrl}?limit=${limit}&offset=${offset}`);

  if (!response.ok) {
    throw new Error("Error al obtener la lista de pokemons");
  }

  const payload = (await response.json()) as interfaces.PokemonListResponse;

  const results = payload.results.map((pokemon) => ({
    ...pokemon,
    sprite: `${pokeApiSpriteUrl}/${getPokemonIdFromUrl(pokemon.url)}.png`,
  }));

  return {
    ...payload,
    results,
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
  getPokemonById,
};
