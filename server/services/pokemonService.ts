import type interfaces = require("../../shared/interfaces");

const { POKEMONS } = require("../data/pokemonList") as {
  POKEMONS: interfaces.PokemonListResponse;
};

async function getPokemonList(): Promise<interfaces.PokemonListResponse> {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");

  if (!response.ok) {
    throw new Error("Error al obtener la lista de pokemons");
  }

  const payload = (await response.json()) as interfaces.PokemonListResponse;

  return payload;
}

module.exports = {
  getPokemonList,
};
