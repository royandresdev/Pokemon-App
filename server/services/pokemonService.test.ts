import type interfaces = require("../../shared/interfaces");

describe("pokemonService", () => {
  it("devuelve la estructura paginada de pokemons", () => {
    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => interfaces.PokemonListResponse;
    };

    const result = getPokemonList();

    expect(result).toEqual(
      expect.objectContaining({
        count: "1350",
        next: null,
        previous: null,
        results: expect.any(Array),
      }),
    );
  });

  it("devuelve pokemons con name y url", () => {
    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => interfaces.PokemonListResponse;
    };

    const result = getPokemonList();

    expect(result.results.length).toBeGreaterThan(0);
    result.results.forEach((pokemon) => {
      expect(typeof pokemon.name).toBe("string");
      expect(typeof pokemon.url).toBe("string");
    });
  });
});
