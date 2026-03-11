import type interfaces = require("../../shared/interfaces");

const fetchMock = jest.fn();

global.fetch = fetchMock as typeof fetch;

describe("pokemonService", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    jest.resetModules();
  });

  const pokemonResponse: interfaces.Pokemon = {
    abilities: [
      {
        ability: { name: "overgrow", url: "https://example.com/ability/65" },
        is_hidden: false,
        slot: 1,
      },
    ],
    base_experience: 64,
    cries: {
      latest: "https://example.com/cries/latest.ogg",
      legacy: "https://example.com/cries/legacy.ogg",
    },
    forms: [{ name: "bulbasaur", url: "https://example.com/forms/1" }],
    game_indices: [
      {
        game_index: 1,
        version: { name: "red", url: "https://example.com/version/red" },
      },
    ],
    height: 7,
    held_items: [],
    id: 1,
    is_default: true,
    location_area_encounters: "https://example.com/pokemon/1/encounters",
    moves: [],
    name: "bulbasaur",
    order: 1,
    past_abilities: [],
    past_stats: [],
    past_types: [],
    species: { name: "bulbasaur", url: "https://example.com/species/1" },
    sprites: {
      back_default: "https://example.com/sprites/back.png",
      back_female: null,
      back_shiny: "https://example.com/sprites/back-shiny.png",
      back_shiny_female: null,
      front_default: "https://example.com/sprites/front.png",
      front_female: null,
      front_shiny: "https://example.com/sprites/front-shiny.png",
      front_shiny_female: null,
    },
    stats: [
      {
        base_stat: 45,
        effort: 0,
        stat: { name: "hp", url: "https://example.com/stat/hp" },
      },
    ],
    types: [
      { slot: 1, type: { name: "grass", url: "https://example.com/grass" } },
    ],
    weight: 69,
  };

  it("devuelve la estructura paginada de pokemons", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
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
      getPokemonList: (
        limit?: number,
        offset?: number,
      ) => Promise<interfaces.PokemonListResponse>;
    };

    const result = await getPokemonList();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/pokemon?limit=20&offset=0",
    );

    expect(result).toEqual(
      expect.objectContaining({
        count: "1350",
        next: null,
        previous: null,
        results: expect.any(Array),
      }),
    );
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.sprite).toBe("https://example.com/sprites/1.png");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("devuelve pokemons con name, url y sprite", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
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
      getPokemonList: (
        limit?: number,
        offset?: number,
      ) => Promise<interfaces.PokemonListResponse>;
    };

    const result = await getPokemonList();

    expect(result.results.length).toBeGreaterThan(0);
    result.results.forEach((pokemon) => {
      expect(typeof pokemon.name).toBe("string");
      expect(typeof pokemon.url).toBe("string");
      expect(typeof pokemon.sprite).toBe("string");
    });

    expect(result.results[0]!.sprite).toBe("https://example.com/sprites/1.png");
    expect(result.results[1]!.sprite).toBe("https://example.com/sprites/2.png");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("lanza un error si PokeAPI responde con error", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
      }),
    }));

    fetchMock.mockResolvedValue({
      ok: false,
    });

    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => Promise<interfaces.PokemonListResponse>;
    };

    await expect(getPokemonList()).rejects.toThrow(
      "Error al obtener la lista de pokemons",
    );
  });

  it("getPokemonById devuelve el pokemon con el id indicado", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
      }),
    }));

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => pokemonResponse,
    });

    const { getPokemonById } = require("./pokemonService") as {
      getPokemonById: (id: string) => Promise<interfaces.Pokemon>;
    };

    const result = await getPokemonById("1");

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/pokemon/1");
    expect(result.id).toBe(1);
    expect(result.name).toBe("bulbasaur");
    expect(result.cries.latest).toBe("https://example.com/cries/latest.ogg");
    expect(result.sprites.back_default).toBe(
      "https://example.com/sprites/back.png",
    );
  });

  it("getPokemonById lanza un error si PokeAPI responde con error", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
      }),
    }));

    fetchMock.mockResolvedValue({ ok: false });

    const { getPokemonById } = require("./pokemonService") as {
      getPokemonById: (id: string) => Promise<interfaces.Pokemon>;
    };

    await expect(getPokemonById("1")).rejects.toThrow(
      "Error al obtener el pokemon",
    );
  });
});
