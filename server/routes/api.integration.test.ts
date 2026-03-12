import type interfaces = require("../../shared/interfaces");

const { withServer } = require("../testUtils/withServer") as {
  withServer: (fn: (baseUrl: string) => Promise<void>) => Promise<void>;
};

const pokemonListResponseMock: interfaces.PokemonListResponse = {
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

const pokemonResponseMock: interfaces.Pokemon = {
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

const pokemonSearchMock = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
      sprite: "https://example.com/sprites/front.png",
    },
  ],
};

jest.mock("../services/pokemonService", () => ({
  getPokemonList: jest.fn().mockResolvedValue(pokemonListResponseMock),
  getPokemonById: jest.fn().mockResolvedValue(pokemonResponseMock),
  searchPokemons: jest.fn().mockResolvedValue(pokemonSearchMock),
}));

describe("API integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("permite solicitudes CORS desde cualquier origen", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({}),
      });

      expect(response.headers.get("access-control-allow-origin")).toBe("*");
    });
  });

  it("expone POST /login", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).not.toBe(404);
    });
  });

  it("rechaza campos no permitidos en /login", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "admin",
          role: "superadmin",
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  it("expone GET /pokemons", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons`);

      expect(response.status).not.toBe(404);
    });
  });

  it("devuelve la lista de pokemons en /pokemons", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons`);

      expect(response.ok).toBe(true);
      const body = (await response.json()) as interfaces.PokemonListResponse;

      expect(Array.isArray(body.results)).toBe(true);
      expect(body.results.length).toBeGreaterThan(0);
      expect(body.results[0]!.sprite).toBe(
        "https://example.com/sprites/front.png",
      );
    });
  });

  it("acepta limit y offset en /pokemons y los pasa al servicio", async () => {
    const { getPokemonList } = require("../services/pokemonService") as {
      getPokemonList: jest.Mock;
    };

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons?limit=40&offset=80`);

      expect(response.ok).toBe(true);
    });

    expect(getPokemonList).toHaveBeenCalledWith(40, 80, "number");
  });

  it("expone GET /pokemons/:id", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons/1`);

      expect(response.status).not.toBe(404);
    });
  });

  it("devuelve el pokemon con el id indicado en /pokemons/:id", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons/1`);

      expect(response.ok).toBe(true);
      const body = (await response.json()) as interfaces.Pokemon;

      expect(body.id).toBe(1);
      expect(body.name).toBe("bulbasaur");
      expect(Array.isArray(body.types)).toBe(true);
      expect(body.cries.latest).toBe("https://example.com/cries/latest.ogg");
    });
  });

  it("expone GET /pokemons/search", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons/search?name=bulba`);
      expect(response.status).not.toBe(404);
    });
  });

  it("devuelve pokemons filtrados por nombre en /pokemons/search", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/pokemons/search?name=bulba`);
      expect(response.ok).toBe(true);
      const body = await response.json();
      expect(body.results.length).toBe(1);
      expect(body.results[0].name).toBe("bulbasaur");
    });
  });
});
