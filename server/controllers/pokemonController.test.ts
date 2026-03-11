import type interfaces = require("../../shared/interfaces");

const pokemonListResponse: interfaces.PokemonListResponse = {
  count: "1350",
  next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
  previous: null,
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
    },
  ],
};

jest.mock("../services/pokemonService", () => ({
  getPokemonList: jest.fn().mockResolvedValue(pokemonListResponse),
}));

describe("pokemonController", () => {
  it("responde con la lista de pokemons resuelta por el servicio", async () => {
    const { listPokemonsController } = require("./pokemonController") as {
      listPokemonsController: (
        request: unknown,
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
});
