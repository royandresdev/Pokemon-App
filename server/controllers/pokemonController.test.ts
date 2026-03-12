import type interfaces = require("../../shared/interfaces");

const pokemonListResponse: interfaces.PokemonListResponse = {
  count: "1350",
  next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
  previous: null,
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
      sprite: "https://example.com/sprites/front.png",
    },
  ],
};

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
  id: 1,
  height: 7,
  held_items: [],
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

jest.mock("../services/pokemonService", () => ({
  getPokemonList: jest.fn().mockResolvedValue(pokemonListResponse),
  getPokemonById: jest.fn().mockResolvedValue(pokemonResponse),
}));

describe("pokemonController", () => {
  it("listPokemonsController pasa sortBy al servicio", async () => {
    const { listPokemonsController } = require("./pokemonController") as {
      listPokemonsController: (
        request: {
          query?: { limit?: string; offset?: string; sortBy?: string };
        },
        response: {
          status: (statusCode: number) => {
            json: (payload: unknown) => unknown;
          };
        },
      ) => Promise<unknown>;
    };

    const { getPokemonList } = require("../services/pokemonService") as {
      getPokemonList: jest.Mock;
    };

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));

    await listPokemonsController(
      { query: { limit: "10", offset: "5", sortBy: "alphabetical" } },
      { status },
    );

    expect(getPokemonList).toHaveBeenCalledWith(10, 5, "alphabetical");
    expect(status).toHaveBeenCalledWith(200);
  });
  it("responde con la lista de pokemons resuelta por el servicio", async () => {
    const { listPokemonsController } = require("./pokemonController") as {
      listPokemonsController: (
        request: { query?: { limit?: string; offset?: string } },
        response: {
          status: (statusCode: number) => {
            json: (payload: unknown) => unknown;
          };
        },
      ) => Promise<unknown>;
    };

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));

    await listPokemonsController({}, { status });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(pokemonListResponse);
  });

  it("listPokemonsController pasa limit y offset al servicio", async () => {
    const { listPokemonsController } = require("./pokemonController") as {
      listPokemonsController: (
        request: { query?: { limit?: string; offset?: string } },
        response: {
          status: (statusCode: number) => {
            json: (payload: unknown) => unknown;
          };
        },
      ) => Promise<unknown>;
    };

    const { getPokemonList } = require("../services/pokemonService") as {
      getPokemonList: jest.Mock;
    };

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));

    await listPokemonsController(
      { query: { limit: "40", offset: "80" } },
      { status },
    );

    expect(getPokemonList).toHaveBeenCalledWith(40, 80, "number");
    expect(status).toHaveBeenCalledWith(200);
  });

  it("getPokemonByIdController responde con el pokemon del servicio", async () => {
    const { getPokemonByIdController } = require("./pokemonController") as {
      getPokemonByIdController: (
        request: { params: { id: string } },
        response: {
          status: (statusCode: number) => {
            json: (payload: unknown) => unknown;
          };
        },
      ) => Promise<unknown>;
    };

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));

    await getPokemonByIdController({ params: { id: "1" } }, { status });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(pokemonResponse);
  });
});
