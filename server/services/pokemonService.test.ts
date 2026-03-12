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
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        count: "1",
        next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
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
        sortBy?: "number" | "alphabetical",
      ) => Promise<interfaces.PokemonListResponse>;
    };

    const result = await getPokemonList();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/pokemon?limit=2000&offset=0",
    );

    expect(result).toEqual(
      expect.objectContaining({
        count: 1,
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
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        count: 2,
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
        sortBy?: "number" | "alphabetical",
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

  it("getPokemonList reutiliza el catalogo cacheado entre llamadas", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        count: 3,
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
          {
            name: "venusaur",
            url: "https://pokeapi.co/api/v2/pokemon/3/",
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

    const firstPage = await getPokemonList(2, 0);
    const secondPage = await getPokemonList(2, 2);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstPage.results.map((pokemon) => pokemon.name)).toEqual([
      "bulbasaur",
      "ivysaur",
    ]);
    expect(secondPage.results.map((pokemon) => pokemon.name)).toEqual([
      "venusaur",
    ]);
    expect(firstPage.next).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=2",
    );
    expect(secondPage.previous).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=0",
    );
  });

  it("getPokemonList ordena alfabeticamente cuando sortBy es alphabetical", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        count: "3",
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
          {
            name: "charmander",
            url: "https://pokeapi.co/api/v2/pokemon/4/",
          },
        ],
      }),
    });

    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: (
        limit?: number,
        offset?: number,
        sortBy?: "number" | "alphabetical",
      ) => Promise<interfaces.PokemonListResponse>;
    };

    const result = await getPokemonList(3, 0, "alphabetical");

    expect(result.results.map((pokemon) => pokemon.name)).toEqual([
      "bulbasaur",
      "charmander",
      "ivysaur",
    ]);
    expect(result.next).toBe(null);
  });

  it("getPokemonList ordena por numero cuando sortBy es number", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        count: "3",
        next: null,
        previous: null,
        results: [
          {
            name: "wartortle",
            url: "https://pokeapi.co/api/v2/pokemon/8/",
          },
          {
            name: "ivysaur",
            url: "https://pokeapi.co/api/v2/pokemon/2/",
          },
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
        sortBy?: "number" | "alphabetical",
      ) => Promise<interfaces.PokemonListResponse>;
    };

    const result = await getPokemonList(3, 0, "number");

    expect(result.results.map((pokemon) => pokemon.name)).toEqual([
      "bulbasaur",
      "ivysaur",
      "wartortle",
    ]);
  });

  it("getPokemonCatalog devuelve el catalogo completo con sprite", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        count: "1350",
        next: "https://pokeapi.co/api/v2/pokemon?offset=2000&limit=2000",
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

    const { getPokemonCatalog } = require("./pokemonService") as {
      getPokemonCatalog: () => Promise<interfaces.PokemonListItem[]>;
    };

    const result = await getPokemonCatalog();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/pokemon?limit=2000&offset=0",
    );
    expect(result).toHaveLength(2);
    expect(result[0]!.sprite).toBe("https://example.com/sprites/1.png");
  });

  it("getPokemonCatalog lanza error si PokeAPI falla", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({ ok: false });

    const { getPokemonCatalog } = require("./pokemonService") as {
      getPokemonCatalog: () => Promise<interfaces.PokemonListResponse>;
    };

    await expect(getPokemonCatalog()).rejects.toThrow(
      "Error al obtener el catalogo de pokemons",
    );
  });

  it("paginatePokemonCatalog devuelve slice con next y previous calculados", () => {
    const { paginatePokemonCatalog } = require("./pokemonService") as {
      paginatePokemonCatalog: (
        catalog: interfaces.PokemonListItem[],
        limit: number,
        offset: number,
        baseUrl: string,
        sortBy: interfaces.SortBy,
      ) => interfaces.PokemonListResponse;
    };

    const catalog: interfaces.PokemonListItem[] = [
      {
        name: "bulbasaur",
        url: "https://pokeapi.co/api/v2/pokemon/1/",
        sprite: "https://example.com/sprites/1.png",
      },
      {
        name: "ivysaur",
        url: "https://pokeapi.co/api/v2/pokemon/2/",
        sprite: "https://example.com/sprites/2.png",
      },
      {
        name: "venusaur",
        url: "https://pokeapi.co/api/v2/pokemon/3/",
        sprite: "https://example.com/sprites/3.png",
      },
    ];

    const result = paginatePokemonCatalog(
      catalog,
      2,
      1,
      "http://localhost:3000/pokemons",
      "number",
    );

    expect(result.results.map((pokemon) => pokemon.name)).toEqual([
      "ivysaur",
      "venusaur",
    ]);
    expect(result.next).toBe(null);
    expect(result.previous).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=0",
    );
  });

  it("paginatePokemonCatalog incluye sortBy alphabetical en next y previous", () => {
    const { paginatePokemonCatalog } = require("./pokemonService") as {
      paginatePokemonCatalog: (
        catalog: interfaces.PokemonListItem[],
        limit: number,
        offset: number,
        apiPublicBaseUrl: string,
        sortBy?: "number" | "alphabetical",
      ) => interfaces.PokemonListResponse;
    };

    const catalog: interfaces.PokemonListItem[] = [
      {
        name: "bulbasaur",
        url: "https://pokeapi.co/api/v2/pokemon/1/",
        sprite: "https://example.com/sprites/1.png",
      },
      {
        name: "ivysaur",
        url: "https://pokeapi.co/api/v2/pokemon/2/",
        sprite: "https://example.com/sprites/2.png",
      },
      {
        name: "venusaur",
        url: "https://pokeapi.co/api/v2/pokemon/3/",
        sprite: "https://example.com/sprites/3.png",
      },
      {
        name: "charmander",
        url: "https://pokeapi.co/api/v2/pokemon/4/",
        sprite: "https://example.com/sprites/4.png",
      },
      {
        name: "charmeleon",
        url: "https://pokeapi.co/api/v2/pokemon/5/",
        sprite: "https://example.com/sprites/5.png",
      },
    ];

    const result = paginatePokemonCatalog(
      catalog,
      2,
      2,
      "http://localhost:3000/pokemons",
      "alphabetical",
    );

    expect(result.next).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=4&sortBy=alphabetical",
    );
    expect(result.previous).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=0&sortBy=alphabetical",
    );
  });

  it("paginatePokemonCatalog devuelve valores por defecto para paginacion invalida", () => {
    const { paginatePokemonCatalog } = require("./pokemonService") as {
      paginatePokemonCatalog: (
        catalog: interfaces.PokemonListItem[],
        limit: number,
        offset: number,
        apiPublicBaseUrl: string,
        sortBy?: "number" | "alphabetical",
      ) => interfaces.PokemonListResponse;
    };

    const catalog: interfaces.PokemonListItem[] = [
      {
        name: "bulbasaur",
        url: "https://pokeapi.co/api/v2/pokemon/1/",
        sprite: "https://example.com/sprites/1.png",
      },
      {
        name: "ivysaur",
        url: "https://pokeapi.co/api/v2/pokemon/2/",
        sprite: "https://example.com/sprites/2.png",
      },
      {
        name: "venusaur",
        url: "https://pokeapi.co/api/v2/pokemon/3/",
        sprite: "https://example.com/sprites/3.png",
      },
      {
        name: "charmander",
        url: "https://pokeapi.co/api/v2/pokemon/4/",
        sprite: "https://example.com/sprites/4.png",
      },
    ];

    const result = paginatePokemonCatalog(
      catalog,
      -1,
      -4,
      "http://localhost:3000",
    );

    expect(result.results).toHaveLength(4);
    expect(result.previous).toBe(null);
    expect(result.next).toBe(null);
  });

  it("lanza un error si PokeAPI responde con error", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValue({
      ok: false,
    });

    const { getPokemonList } = require("./pokemonService") as {
      getPokemonList: () => Promise<interfaces.PokemonListResponse>;
    };

    await expect(getPokemonList()).rejects.toThrow(
      "Error al obtener el catalogo de pokemons",
    );
  });

  it("getPokemonById devuelve el pokemon con el id indicado", async () => {
    jest.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
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
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
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

  describe("searchPokemons", () => {
    beforeEach(() => {
      fetchMock.mockReset();
      jest.resetModules();
    });

    it("devuelve pokemons filtrados por nombre", async () => {
      jest.doMock("../config/env", () => ({
        getEnvConfig: () => ({
          port: 3000,
          pokeApiUrl: "https://example.com/pokemon",
          pokeApiSpriteUrl: "https://example.com/sprites",
          apiPublicBaseUrl: "http://localhost:3000",
        }),
      }));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          count: "3",
          next: null,
          previous: null,
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
            { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
          ],
        }),
      });

      const { searchPokemons } = require("./pokemonService") as {
        searchPokemons: (
          name: string,
          limit?: number,
          offset?: number,
          sortBy?: "number" | "alphabetical",
        ) => Promise<interfaces.PokemonListResponse>;
      };

      const result = await searchPokemons("saur");
      expect(result.results.map((p) => p.name)).toEqual([
        "bulbasaur",
        "ivysaur",
        "venusaur",
      ]);
      expect(result.count).toBe(3);
    });

    it("devuelve resultados vacíos si no hay coincidencias", async () => {
      jest.doMock("../config/env", () => ({
        getEnvConfig: () => ({
          port: 3000,
          pokeApiUrl: "https://example.com/pokemon",
          pokeApiSpriteUrl: "https://example.com/sprites",
          apiPublicBaseUrl: "http://localhost:3000",
        }),
      }));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          count: "3",
          next: null,
          previous: null,
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
            { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
          ],
        }),
      });

      const { searchPokemons } = require("./pokemonService") as {
        searchPokemons: (
          name: string,
          limit?: number,
          offset?: number,
          sortBy?: "number" | "alphabetical",
        ) => Promise<interfaces.PokemonListResponse>;
      };

      const result = await searchPokemons("pikachu");
      expect(result.results).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("devuelve paginación correcta", async () => {
      jest.doMock("../config/env", () => ({
        getEnvConfig: () => ({
          port: 3000,
          pokeApiUrl: "https://example.com/pokemon",
          pokeApiSpriteUrl: "https://example.com/sprites",
          apiPublicBaseUrl: "http://localhost:3000",
        }),
      }));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          count: "3",
          next: null,
          previous: null,
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
            { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
          ],
        }),
      });

      const { searchPokemons } = require("./pokemonService") as {
        searchPokemons: (
          name: string,
          limit?: number,
          offset?: number,
          sortBy?: "number" | "alphabetical",
        ) => Promise<interfaces.PokemonListResponse>;
      };

      const result = await searchPokemons("saur", 2, 1);
      expect(result.results.map((p) => p.name)).toEqual([
        "ivysaur",
        "venusaur",
      ]);
      expect(result.count).toBe(3);
      expect(result.previous).toContain("offset=0");
      expect(result.next).toBe(null);
    });

    it("ordena por nombre si se indica sortBy alphabetical", async () => {
      jest.doMock("../config/env", () => ({
        getEnvConfig: () => ({
          port: 3000,
          pokeApiUrl: "https://example.com/pokemon",
          pokeApiSpriteUrl: "https://example.com/sprites",
          apiPublicBaseUrl: "http://localhost:3000",
        }),
      }));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          count: "3",
          next: null,
          previous: null,
          results: [
            { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
          ],
        }),
      });

      const { searchPokemons } = require("./pokemonService") as {
        searchPokemons: (
          name: string,
          limit?: number,
          offset?: number,
          sortBy?: "number" | "alphabetical",
        ) => Promise<interfaces.PokemonListResponse>;
      };

      const result = await searchPokemons("saur", 3, 0, "alphabetical");
      expect(result.results.map((p) => p.name)).toEqual([
        "bulbasaur",
        "ivysaur",
        "venusaur",
      ]);
    });

    it("maneja límites y offsets inválidos", async () => {
      jest.doMock("../config/env", () => ({
        getEnvConfig: () => ({
          port: 3000,
          pokeApiUrl: "https://example.com/pokemon",
          pokeApiSpriteUrl: "https://example.com/sprites",
          apiPublicBaseUrl: "http://localhost:3000",
        }),
      }));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          count: "3",
          next: null,
          previous: null,
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
            { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
          ],
        }),
      });

      const { searchPokemons } = require("./pokemonService") as {
        searchPokemons: (
          name: string,
          limit?: number,
          offset?: number,
          sortBy?: "number" | "alphabetical",
        ) => Promise<interfaces.PokemonListResponse>;
      };

      const result = await searchPokemons("saur", -1, -5);
      expect(result.results.length).toBe(3);
      expect(result.previous).toBe(null);
      expect(result.next).toBe(null);
    });
  });
});
