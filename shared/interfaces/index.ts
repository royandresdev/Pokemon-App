export interface PokemonListResponse {
  count: number | string;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}
