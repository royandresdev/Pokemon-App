describe("env config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("carga dotenv al inicializar el entorno", () => {
    const configMock = jest.fn();

    jest.doMock("dotenv", () => ({
      config: configMock,
    }));

    const { loadEnvironment } = require("./env") as {
      loadEnvironment: () => void;
    };

    loadEnvironment();

    expect(configMock).toHaveBeenCalledTimes(1);
  });

  it("devuelve la configuración desde process.env", () => {
    jest.doMock("dotenv", () => ({
      config: jest.fn(),
    }));

    process.env.PORT = "4500";
    process.env.POKE_API_URL = "https://example.com/pokemon";
    process.env.POKE_API_SPRITE_URL = "https://example.com/sprites";

    const { getEnvConfig } = require("./env") as {
      getEnvConfig: () => {
        port: number;
        pokeApiUrl: string;
        pokeApiSpriteUrl: string;
      };
    };

    expect(getEnvConfig()).toEqual({
      port: 4500,
      pokeApiUrl: "https://example.com/pokemon",
      pokeApiSpriteUrl: "https://example.com/sprites",
    });
  });

  it("lanza un error claro cuando POKE_API_URL no está definida", () => {
    jest.doMock("dotenv", () => ({
      config: jest.fn(),
    }));

    delete process.env.PORT;
    delete process.env.POKE_API_URL;

    const { getEnvConfig } = require("./env") as {
      getEnvConfig: () => { port: number; pokeApiUrl: string };
    };

    expect(() => getEnvConfig()).toThrow("POKE_API_URL no está definida");
  });

  it("lanza un error claro cuando POKE_API_SPRITE_URL no está definida", () => {
    jest.doMock("dotenv", () => ({
      config: jest.fn(),
    }));

    process.env.PORT = "3000";
    process.env.POKE_API_URL = "https://example.com/pokemon";
    delete process.env.POKE_API_SPRITE_URL;

    const { getEnvConfig } = require("./env") as {
      getEnvConfig: () => { port: number; pokeApiUrl: string };
    };

    expect(() => getEnvConfig()).toThrow(
      "POKE_API_SPRITE_URL no está definida",
    );
  });
});
