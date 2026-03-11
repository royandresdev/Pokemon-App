import { useEffect, useState } from "react";
import type { PokemonListResponse } from "../../../shared/interfaces";

const HomePage = () => {
  const [pokemons, setPokemons] = useState<PokemonListResponse["results"]>([]);

  useEffect(() => {
    const getPokemons = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pokemons`);
      const payload = await response.json() as PokemonListResponse;

      setPokemons(payload.results);
    };

    void getPokemons();
  }, []);

  return (
    <main>
      <h1>Pokémon App</h1>
      <ul>
        {pokemons.map((pokemon) => (
          <li key={pokemon.name}>{pokemon.name}</li>
        ))}
      </ul>
    </main>
  );
};

export default HomePage;
