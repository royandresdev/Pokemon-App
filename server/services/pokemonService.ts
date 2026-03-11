import type interfaces = require("../../shared/interfaces");

const { POKEMONS } = require("../data/pokemonList") as {
  POKEMONS: interfaces.PokemonListResponse;
};

function getPokemonList(): interfaces.PokemonListResponse {
  return POKEMONS;
}

module.exports = {
  getPokemonList,
};
