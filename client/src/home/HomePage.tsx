import { useCallback, useEffect, useRef, useState } from "react";
import type { PokemonListResponse, QueryParams, SortBy } from "../../../shared/interfaces";
import PokemonCard from "./PokemonCard";
import { useDebounce } from "use-debounce";
import { FaAngleDown } from "react-icons/fa6";
import { MdCatchingPokemon } from "react-icons/md";

const HomePage = () => {
  const [pokemons, setPokemons] = useState<PokemonListResponse["results"]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("number");
  const [search, setSearch] = useState("");
  const [searchDebounced] = useDebounce(search, 300);
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Cerrar filtros al hacer click fuera
  useEffect(() => {
    if (!showFilters) return;
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

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
    <main className="max-w-md mx-auto bg-gray-200 min-h-screen pt-4">
      <header className="bg-white shadow p-4 mx-4 mb-6 rounded-lg">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-2xl text-red-400 font-semibold flex items-center gap-2">
            <MdCatchingPokemon />  Pokédex
          </h2>
        </div>
      </header>
      <div className="px-4">
        <div className="home-controls relative">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="mb-4 font-semibold flex items-center gap-1"
          >
            {sortBy === "number" ? "Numérico" : "Alfabético"} <FaAngleDown />
          </button>
          {showFilters && (
            <div
              ref={filtersRef}
              className="absolute top-6 left-0 bg-white border border-gray-300 rounded-lg p-4 z-10 shadow-lg"
            >
              <p className="w-full whitespace-nowrap mb-3">Ordenar por:</p>
              <label className="flex gap-2">
                <input
                  type="radio"
                  name="sortBy"
                  value="number"
                  checked={sortBy === "number"}
                  onChange={() => setSortBy("number")}
                />
                Número
              </label>
              <label className="flex gap-2">
                <input
                  type="radio"
                  name="sortBy"
                  value="alphabetical"
                  checked={sortBy === "alphabetical"}
                  onChange={() => setSortBy("alphabetical")}
                />
                Nombre
              </label>
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Buscar pokémon..."
          value={search}
          onChange={handleSearchChange}
          className="shadow block p-4 w-full mb-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <ul className="grid grid-cols-3 gap-4 gap-y-6 px-4">
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
