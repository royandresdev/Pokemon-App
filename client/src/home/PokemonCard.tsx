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
    <article>
      <p>#{pokemonId}</p>
      <img src={pokemon.sprite} alt={`Sprite de ${pokemon.name}`} loading="lazy" />
      <h2>{pokemon.name}</h2>
    </article>
  );
};

export default PokemonCard;
