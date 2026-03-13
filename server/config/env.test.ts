import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("env config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("carga dotenv al inicializar el entorno", async () => {
    const configMock = vi.fn();

    vi.doMock("dotenv", () => ({
      config: configMock,
      default: { config: configMock },
    }));

    const { loadEnvironment } = await import("./env.js");

    loadEnvironment();

    expect(configMock).toHaveBeenCalledTimes(1);
  });

  it("devuelve la configuración desde process.env", async () => {
    vi.doMock("dotenv", () => ({
      config: vi.fn(),
    }));

    process.env.PORT = "4500";
    process.env.POKE_API_URL = "https://example.com/pokemon";
    process.env.POKE_API_SPRITE_URL = "https://example.com/sprites";
    process.env.API_PUBLIC_BASE_URL = "https://api.example.com";

    const { getEnvConfig } = await import("./env.js");

    expect(getEnvConfig()).toEqual({
      port: 4500,
      pokeApiUrl: "https://example.com/pokemon",
      pokeApiSpriteUrl: "https://example.com/sprites",
      apiPublicBaseUrl: "https://api.example.com",
    });
  });

  it("lanza un error claro cuando POKE_API_URL no está definida", async () => {
    vi.doMock("dotenv", () => ({
      config: vi.fn(),
    }));

    delete process.env.PORT;
    delete process.env.POKE_API_URL;

    const { getEnvConfig } = await import("./env.js");

    expect(() => getEnvConfig()).toThrow("POKE_API_URL no está definida");
  });

  it("lanza un error claro cuando POKE_API_SPRITE_URL no está definida", async () => {
    vi.doMock("dotenv", () => ({
      config: vi.fn(),
    }));

    process.env.PORT = "3000";
    process.env.POKE_API_URL = "https://example.com/pokemon";
    delete process.env.POKE_API_SPRITE_URL;

    const { getEnvConfig } = await import("./env.js");

    expect(() => getEnvConfig()).toThrow(
      "POKE_API_SPRITE_URL no está definida",
    );
  });

  it("lanza un error claro cuando API_PUBLIC_BASE_URL no está definida", async () => {
    vi.doMock("dotenv", () => ({
      config: vi.fn(),
    }));

    process.env.PORT = "3000";
    process.env.POKE_API_URL = "https://example.com/pokemon";
    process.env.POKE_API_SPRITE_URL = "https://example.com/sprites";
    delete process.env.API_PUBLIC_BASE_URL;

    const { getEnvConfig } = await import("./env.js");

    expect(() => getEnvConfig()).toThrow(
      "API_PUBLIC_BASE_URL no está definida",
    );
  });
});
