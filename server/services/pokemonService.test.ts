import type interfaces = require("../../shared/interfaces");

const fetchMock = jest.fn();

global.fetch = fetchMock as typeof fetch;

describe("pokemonService", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    jest.resetModules();
  });

  it("devuelve la estructura paginada de pokemons", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
      }),
    }));

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

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/pokemon?limit=20");

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
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
      }),
    }));

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
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
      }),
    }));

    fetchMock.mockResolvedValue({
      ok: false,
    });

    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => Promise<interfaces.PokemonListResponse>;
    };

    await expect(getPokemonList()).rejects.toThrow("Error al obtener la lista de pokemons");
  });
});
