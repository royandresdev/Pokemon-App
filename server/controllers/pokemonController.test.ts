import type interfaces = require("../../shared/interfaces");
import { vi, describe, it, expect, beforeEach } from "vitest";

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

vi.mock("../services/pokemonService", () => ({
  getPokemonList: vi.fn().mockResolvedValue(pokemonListResponse),
  getPokemonById: vi.fn().mockResolvedValue(pokemonResponse),
  searchPokemons: vi.fn(),
}));

describe("pokemonController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("listPokemonsController pasa sortBy al servicio", async () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    const { listPokemonsController } = await import("./pokemonController.js");

    const { getPokemonList } = await import("../services/pokemonService.js");

    expect(getPokemonList).toHaveBeenCalledWith(10, 5, "alphabetical");
    expect(status).toHaveBeenCalledWith(200);
  });
  it("responde con la lista de pokemons resuelta por el servicio", async () => {
    const { listPokemonsController } = await import("./pokemonController.js");
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    await listPokemonsController({}, { status });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(pokemonListResponse);
  });

  it("listPokemonsController pasa limit y offset al servicio", async () => {
    const { listPokemonsController } = await import("./pokemonController");
    const { getPokemonList } = await import("../services/pokemonService");
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    await listPokemonsController(
      { query: { limit: "40", offset: "80" } },
      { status },
    );
    expect(getPokemonList).toHaveBeenCalledWith(40, 80, "number");
    expect(status).toHaveBeenCalledWith(200);
  });

  it("getPokemonByIdController responde con el pokemon del servicio", async () => {
    const { getPokemonByIdController } = await import("./pokemonController");
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    await getPokemonByIdController({ params: { id: "1" } }, { status });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(pokemonResponse);
  });
  describe("searchPokemonsController", () => {
    it("pasa limit, offset y sortby al servicio", async () => {
      const { searchPokemons } = await import("../services/pokemonService");
      searchPokemons.mockResolvedValueOnce({
        count: 1,
        results: [{ name: "bulbasaur" }],
      });
      const { searchPokemonsController } = await import("./pokemonController");
      const json = vi.fn();
      const status = vi.fn(() => ({ json }));
      await searchPokemonsController(
        {
          query: {
            name: "bulba",
            limit: "5",
            offset: "10",
            sortby: "alphabetical",
          },
        },
        { status },
      );
      expect(searchPokemons).toHaveBeenCalledWith(
        "bulba",
        5,
        10,
        "alphabetical",
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        count: 1,
        results: [{ name: "bulbasaur" }],
      });
    });

    it("usa valores por defecto si limit, offset o sortby no están en query", async () => {
      const { searchPokemons } = await import("../services/pokemonService");
      searchPokemons.mockResolvedValueOnce({
        count: 1,
        results: [{ name: "bulbasaur" }],
      });
      const { searchPokemonsController } = await import("./pokemonController");
      const json = vi.fn();
      const status = vi.fn(() => ({ json }));
      await searchPokemonsController({ query: { name: "bulba" } }, { status });
      expect(searchPokemons).toHaveBeenCalledWith("bulba", 20, 0, "number");
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        count: 1,
        results: [{ name: "bulbasaur" }],
      });
    });
    it("responde con status 200 y el resultado del servicio", async () => {
      const mockResult = { count: 1, results: [{ name: "bulbasaur" }] };
      const { searchPokemons } = await import("../services/pokemonService");
      searchPokemons.mockResolvedValueOnce(mockResult);
      const { searchPokemonsController } = await import("./pokemonController");
      const json = vi.fn();
      const status = vi.fn(() => ({ json }));
      const defaultArguments = [20, 0, "number"];
      await searchPokemonsController({ query: { name: "bulba" } }, { status });
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(mockResult);
      expect(searchPokemons).toHaveBeenCalledWith("bulba", ...defaultArguments);
    });

    it("llama al servicio con string vacío si no hay query.name", async () => {
      const { searchPokemons } = await import("../services/pokemonService");
      searchPokemons.mockResolvedValueOnce({ count: 0, results: [] });
      const { searchPokemonsController } = await import("./pokemonController");
      const json = vi.fn();
      const status = vi.fn(() => ({ json }));
      const defaultArguments = ["", 20, 0, "number"];
      await searchPokemonsController({ query: {} }, { status });
      expect(searchPokemons).toHaveBeenCalledWith(...defaultArguments);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ count: 0, results: [] });
    });
  });
});
