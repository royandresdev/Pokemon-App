import type interfaces = require("../../shared/interfaces");

const fetchMock = jest.fn();

global.fetch = fetchMock as typeof fetch;

describe("pokemonService", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("devuelve la estructura paginada de pokemons", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        count: "1350",
        next: null,
        previous: null,
        results: [
          {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon/1/",
          },
        ],
      }),
    });

    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => Promise<interfaces.PokemonListResponse>;
    };

    const result = await getPokemonList();

    expect(result).toEqual(
      expect.objectContaining({
        count: "1350",
        next: null,
        previous: null,
        results: expect.any(Array),
      }),
    );
  });

  it("devuelve pokemons con name y url", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        count: "1350",
        next: null,
        previous: null,
        results: [
          {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon/1/",
          },
          {
            name: "ivysaur",
            url: "https://pokeapi.co/api/v2/pokemon/2/",
          },
        ],
      }),
    });

    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => Promise<interfaces.PokemonListResponse>;
    };

    const result = await getPokemonList();

    expect(result.results.length).toBeGreaterThan(0);
    result.results.forEach((pokemon) => {
      expect(typeof pokemon.name).toBe("string");
      expect(typeof pokemon.url).toBe("string");
    });
  });

  it("lanza un error si PokeAPI responde con error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    });

    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => Promise<interfaces.PokemonListResponse>;
    };

    await expect(getPokemonList()).rejects.toThrow("Error al obtener la lista de pokemons");
  });
});
