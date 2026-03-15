import type { PokemonListItem } from "../../../shared/interfaces";

type PokemonCardProps = {
  pokemon: PokemonListItem;
};

const getPokemonIdFromUrl = (url: string): string => {
  const segments = url.split("/").filter(Boolean);
  return segments.at(-1) ?? "?";
};

const PokemonCard = ({ pokemon }: PokemonCardProps) => {
  const pokemonId = getPokemonIdFromUrl(pokemon.url);

  return (
    <article className="relative mt-20 pt-6 pb-2 bg-white rounded-lg shadow-md">
      <img className="mx-auto h-auto absolute bottom-16 left-1/2 transform -translate-x-1/2" src={pokemon.sprite} alt={`Sprite de ${pokemon.name}`} loading="lazy" />
      <h3 className="capitalize text-center">{pokemon.name}</h3>
      <p className="font-gba text-lg text-center">N°{pokemonId}</p>
    </article>
  );
};

export default PokemonCard;
