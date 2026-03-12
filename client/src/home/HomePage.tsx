import { useCallback, useEffect, useRef, useState } from "react";
import type { PokemonListResponse, SortBy } from "../../../shared/interfaces";
import PokemonCard from "./PokemonCard";

const HomePage = () => {
  const [pokemons, setPokemons] = useState<PokemonListResponse["results"]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("number");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPokemonPage = useCallback(async (url: string, append: boolean) => {
    setIsLoading(true);

    // Añadir sortBy a la URL si no está presente
    const urlObj = new URL(url);
    if (!urlObj.searchParams.has("sortBy")) {
      urlObj.searchParams.set("sortBy", sortBy);
    }

    const response = await fetch(urlObj.toString());
    const payload = await response.json() as PokemonListResponse;

    setPokemons((currentPokemons) => (
      append ? [...currentPokemons, ...payload.results] : payload.results
    ));
    setNextPageUrl(payload.next);
    setIsLoading(false);
  }, [sortBy]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchPokemonPage(`${import.meta.env.VITE_API_URL}/pokemons?sortBy=${sortBy}`, false);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchPokemonPage, sortBy]);

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
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="radio"
            name="sortBy"
            value="number"
            checked={sortBy === "number"}
            onChange={() => setSortBy("number")}
          />
          Orden por número
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="sortBy"
            value="alphabetical"
            checked={sortBy === "alphabetical"}
            onChange={() => setSortBy("alphabetical")}
          />
          Orden alfabético
        </label>
      </div>
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
