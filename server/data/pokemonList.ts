import type { PokemonListResponse } from "../../shared/interfaces/index.js";

const POKEMONS: PokemonListResponse = {
  count: "1350",
  next: null,
  previous: null,
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
      sprite: "https://example.com/sprites/front.png",
    },
    {
      name: "ivysaur",
      url: "https://pokeapi.co/api/v2/pokemon/2/",
      sprite: "https://example.com/sprites/front.png",
    },
    {
      name: "venusaur",
      url: "https://pokeapi.co/api/v2/pokemon/3/",
      sprite: "https://example.com/sprites/front.png",
    },
  ],
};

export { POKEMONS };
