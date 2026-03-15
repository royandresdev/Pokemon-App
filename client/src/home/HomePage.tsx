import { useCallback, useEffect, useRef, useState } from "react";
import type { PokemonListResponse, QueryParams, SortBy } from "../../../shared/interfaces";
import PokemonCard from "./PokemonCard";
import { useDebounce } from "use-debounce";

const HomePage = () => {
  const [pokemons, setPokemons] = useState<PokemonListResponse["results"]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("number");
  const [search, setSearch] = useState("");
  const [searchDebounced] = useDebounce(search, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPokemonPage = useCallback(async (url: string, append: boolean) => {
    setIsLoading(true);

    try {
      const response = await fetch(url);
      const payload = await response.json() as PokemonListResponse;

      setPokemons((currentPokemons) => (
        append ? [...currentPokemons, ...payload.results] : payload.results
      ));
      setNextPageUrl(payload.next);
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const appendQueryParamsToUrl = (url: string, query: QueryParams): string => {
    const urlObj = new URL(url);

    if (query.name) {
      urlObj.searchParams.set("name", query.name);
    }
    if (query.sortby) {
      urlObj.searchParams.set("sortby", query.sortby);
    }
    return urlObj.toString();
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const API_URL = import.meta.env.VITE_API_URL;
      const query: QueryParams = {
        name: searchDebounced,
        sortby: sortBy,
      };
      const url = appendQueryParamsToUrl(`${API_URL}/${searchDebounced ? "pokemons/search" : "pokemons"}`, query);
      void fetchPokemonPage(url, false);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchPokemonPage, sortBy, searchDebounced]);

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
      <div className="home-controls">
        <input
          type="text"
          placeholder="Buscar pokémon..."
          value={search}
          onChange={handleSearchChange}
          style={{ marginRight: "1rem" }}
        />
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
