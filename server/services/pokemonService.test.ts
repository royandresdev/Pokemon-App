import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Pokemon,
  PokemonListItem,
  PokemonListResponse,
  QueryParams,
} from "../../shared/interfaces/index.js";

const fetchMock = vi.fn();

global.fetch = fetchMock as typeof fetch;

describe("pokemonService", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.resetModules();
  });

  const pokemonResponse: Pokemon = {
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
    vi.doMock("../config/env", () => ({
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

    const { getPokemonList } = await import("./pokemonService.js");

    const result = await getPokemonList({});

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
    vi.doMock("../config/env", () => ({
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

    const { getPokemonList } = await import("./pokemonService.js");

    const result = await getPokemonList({});

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
    vi.doMock("../config/env", () => ({
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

    const { getPokemonList } = await import("./pokemonService.js");

    const query: QueryParams = { limit: "2", offset: "0" };

    const firstPage = await getPokemonList(query);
    const secondPage = await getPokemonList({ limit: "2", offset: "2" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstPage.results.map((pokemon) => pokemon.name)).toEqual([
      "bulbasaur",
      "ivysaur",
    ]);
    expect(secondPage.results.map((pokemon) => pokemon.name)).toEqual([
      "venusaur",
    ]);
    expect(firstPage.next).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=2&sortby=number",
    );
    expect(secondPage.previous).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=0&sortby=number",
    );
  });

  it("getPokemonList ordena alfabéticamente cuando sortBy es alphabetical", async () => {
    vi.doMock("../config/env", () => ({
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

    const { getPokemonList } = await import("./pokemonService.js");

    const query: QueryParams = {
      limit: "3",
      offset: "0",
      sortby: "alphabetical",
    };

    const result = await getPokemonList(query);

    expect(result.results.map((pokemon) => pokemon.name)).toEqual([
      "bulbasaur",
      "charmander",
      "ivysaur",
    ]);
    expect(result.next).toBe(null);
  });

  it("getPokemonList ordena por numero cuando sortBy es number", async () => {
    vi.doMock("../config/env", () => ({
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

    const { getPokemonList } = await import("./pokemonService.js");

    const query: QueryParams = { limit: "3", offset: "0", sortby: "number" };
    const result = await getPokemonList(query);

    expect(result.results.map((pokemon) => pokemon.name)).toEqual([
      "bulbasaur",
      "ivysaur",
      "wartortle",
    ]);
  });

  it("getPokemonCatalog devuelve el catalogo completo con sprite", async () => {
    vi.doMock("../config/env", () => ({
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

    const { getPokemonCatalog } = await import("./pokemonService.js");

    const result = await getPokemonCatalog();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/pokemon?limit=2000&offset=0",
    );
    expect(result).toHaveLength(2);
    expect(result[0]!.sprite).toBe("https://example.com/sprites/1.png");
  });

  it("getPokemonCatalog lanza error si PokeAPI falla", async () => {
    vi.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValueOnce({ ok: false });

    const { getPokemonCatalog } = await import("./pokemonService.js");

    await expect(getPokemonCatalog()).rejects.toThrow(
      "Error al obtener el catalogo de pokemons",
    );
  });

  it("paginatePokemonCatalog devuelve slice con next y previous calculados", async () => {
    const { paginatePokemonCatalog } = await import("./pokemonService.js");

    const catalog: PokemonListItem[] = [
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

    const query: QueryParams = { limit: "2", offset: "1", sortby: "number" };

    const result = paginatePokemonCatalog(
      catalog,
      "http://localhost:3000/pokemons",
      query,
    );

    expect(result.results.map((pokemon) => pokemon.name)).toEqual([
      "ivysaur",
      "venusaur",
    ]);
    expect(result.next).toBe(null);
    expect(result.previous).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=0&sortby=number",
    );
  });

  it("paginatePokemonCatalog incluye sortBy alphabetical en next y previous", async () => {
    const { paginatePokemonCatalog } = await import("./pokemonService.js");

    const catalog: PokemonListItem[] = [
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

    const query: QueryParams = {
      limit: "2",
      offset: "2",
      sortby: "alphabetical",
    };

    const result = paginatePokemonCatalog(
      catalog,
      "http://localhost:3000/pokemons",
      query,
    );

    expect(result.next).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=4&sortby=alphabetical",
    );
    expect(result.previous).toBe(
      "http://localhost:3000/pokemons?limit=2&offset=0&sortby=alphabetical",
    );
  });

  it("paginatePokemonCatalog devuelve valores por defecto para paginacion invalida", async () => {
    const { paginatePokemonCatalog } = await import("./pokemonService.js");

    const catalog: PokemonListItem[] = [
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

    const query: QueryParams = { limit: "-1", offset: "-4", sortby: "number" };

    const result = paginatePokemonCatalog(
      catalog,
      "http://localhost:3000",
      query,
    );

    expect(result.results).toHaveLength(4);
    expect(result.previous).toBe(null);
    expect(result.next).toBe(null);
  });

  it("lanza un error si PokeAPI responde con error", async () => {
    vi.doMock("../config/env", () => ({
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

    const { getPokemonList } = await import("./pokemonService.js");

    await expect(getPokemonList({})).rejects.toThrow(
      "Error al obtener el catalogo de pokemons",
    );
  });

  it("getPokemonById devuelve el pokemon con el id indicado", async () => {
    vi.doMock("../config/env", () => ({
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

    const { getPokemonById } = await import("./pokemonService.js");

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
    vi.doMock("../config/env", () => ({
      getEnvConfig: () => ({
        port: 3000,
        pokeApiUrl: "https://example.com/pokemon",
        pokeApiSpriteUrl: "https://example.com/sprites",
        apiPublicBaseUrl: "http://localhost:3000",
      }),
    }));

    fetchMock.mockResolvedValue({ ok: false });

    const { getPokemonById } = await import("./pokemonService.js");

    await expect(getPokemonById("1")).rejects.toThrow(
      "Error al obtener el pokemon",
    );
  });

  describe("searchPokemons", () => {
    beforeEach(() => {
      fetchMock.mockReset();
      vi.resetModules();
    });

    it("devuelve pokemons filtrados por nombre", async () => {
      vi.doMock("../config/env", () => ({
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

      const { searchPokemons } = await import("./pokemonService.js");

      const result = await searchPokemons({ name: "saur" });
      expect(result.results.map((p) => p.name)).toEqual([
        "bulbasaur",
        "ivysaur",
        "venusaur",
      ]);
      expect(result.count).toBe(3);
    });

    it("devuelve resultados vacíos si no hay coincidencias", async () => {
      vi.doMock("../config/env", () => ({
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

      const { searchPokemons } = await import("./pokemonService.js");

      const result = await searchPokemons({ name: "pikachu" });
      expect(result.results).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("devuelve paginación correcta", async () => {
      vi.doMock("../config/env", () => ({
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

      const { searchPokemons } = await import("./pokemonService.js");

      const query: QueryParams = {
        name: "saur",
        limit: "2",
        offset: "1",
        sortby: "number",
      };
      const result = await searchPokemons(query);
      expect(result.results.map((p) => p.name)).toEqual([
        "ivysaur",
        "venusaur",
      ]);
      expect(result.count).toBe(3);
      expect(result.previous).toContain("offset=0");
      expect(result.next).toBe(null);
    });

    it("ordena por nombre si se indica sortBy alphabetical", async () => {
      vi.doMock("../config/env", () => ({
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

      const { searchPokemons } = await import("./pokemonService.js");

      const query: QueryParams = {
        name: "saur",
        limit: "3",
        offset: "0",
        sortby: "alphabetical",
      };
      const result = await searchPokemons(query);
      expect(result.results.map((p) => p.name)).toEqual([
        "bulbasaur",
        "ivysaur",
        "venusaur",
      ]);
    });

    it("maneja límites y offsets inválidos", async () => {
      vi.doMock("../config/env", () => ({
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

      const { searchPokemons } = await import("./pokemonService.js");

      const query: QueryParams = {
        name: "saur",
        limit: "-1",
        offset: "-5",
        sortby: "number",
      };
      const result = await searchPokemons(query);
      expect(result.results.length).toBe(3);
      expect(result.previous).toBe(null);
      expect(result.next).toBe(null);
    });
  });
});
