const dotenv = require("dotenv");

type EnvConfig = {
  port: number;
  pokeApiUrl: string;
};

function loadEnvironment(): void {
  dotenv.config({ quiet: true });
}

function getEnvConfig(): EnvConfig {
  const pokeApiUrl = process.env.POKE_API_URL;

  if (!pokeApiUrl) {
    throw new Error("POKE_API_URL no está definida");
  }

  return {
    port: Number(process.env.PORT ?? 3000),
    pokeApiUrl,
  };
}

module.exports = {
  loadEnvironment,
  getEnvConfig,
};
