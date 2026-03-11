import { useCallback, useEffect, useRef, useState } from "react";
import type { PokemonListResponse } from "../../../shared/interfaces";
import PokemonCard from "./PokemonCard";

const HomePage = () => {
  const [pokemons, setPokemons] = useState<PokemonListResponse["results"]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPokemonPage = useCallback(async (url: string, append: boolean) => {
    setIsLoading(true);

    const response = await fetch(url);
    const payload = await response.json() as PokemonListResponse;

    setPokemons((currentPokemons) => (
      append ? [...currentPokemons, ...payload.results] : payload.results
    ));
    setNextPageUrl(payload.next);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchPokemonPage(`${import.meta.env.VITE_API_URL}/pokemons`, false);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchPokemonPage]);

  useEffect(() => {
    if (!nextPageUrl || isLoading || !sentinelRef.current || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (!entry?.isIntersecting || isLoading || !nextPageUrl) {
        return;
      }

      void fetchPokemonPage(nextPageUrl, true);
    }, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [nextPageUrl, isLoading, fetchPokemonPage]);

  return (
    <main>
      <h1>Pokémon App</h1>
      <ul>
        {pokemons.map((pokemon) => (
          <li key={pokemon.name}>
            <PokemonCard pokemon={pokemon} />
          </li>
        ))}
      </ul>
      {nextPageUrl && <div ref={sentinelRef} data-testid="infinite-scroll-sentinel" />}
    </main>
  );
};

export default HomePage;
