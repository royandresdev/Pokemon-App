import type interfaces = require("../../shared/interfaces");

const { getEnvConfig } = require("../config/env") as {
  getEnvConfig: () => { pokeApiUrl: string };
};

async function getPokemonList(): Promise<interfaces.PokemonListResponse> {
  const { pokeApiUrl } = getEnvConfig();
  const response = await fetch(`${pokeApiUrl}?limit=20`);

  if (!response.ok) {
    throw new Error("Error al obtener la lista de pokemons");
  }

  const payload = (await response.json()) as interfaces.PokemonListResponse;

  return payload;
}

module.exports = {
  getPokemonList,
};
