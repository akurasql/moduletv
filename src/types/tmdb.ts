export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  credits?: {
    cast: TMDBPlayerCast[];
    crew: TMDBPlayerCrew[];
  };
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  credits?: {
    cast: TMDBPlayerCast[];
    crew: TMDBPlayerCrew[];
  };
}

export interface TMDBPlayerCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBPlayerCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime?: number | null;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episodes: TMDBEpisode[];
}

// Fallback high-quality titles in case TMDB fails or key isn't provided
export const fallbackTrendingMovies = [
  {
    id: 823464, // Godzilla x Kong: The New Empire
    title: "Godzilla x Kong: The New Empire",
    overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.",
    poster_path: "/vGo9asYg6iS8q97fHNDU8g80f8t.jpg",
    backdrop_path: "/sR0gJDpyA0fFm6gXmPn36vC6I6g.jpg",
    release_date: "2024-03-27",
    vote_average: 7.2,
    genre_ids: [28, 878, 12],
  },
  {
    id: 76341, // Mad Max: Fury Road
    title: "Mad Max: Fury Road",
    overview: "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and almost everyone is crazed fighting for the necessities of life.",
    poster_path: "/8tZY668v97Vt687866Zg96gXmPn.jpg",
    backdrop_path: "/nlCH85g769hg6gXmPn36vC6I6g.jpg",
    release_date: "2015-05-13",
    vote_average: 8.1,
    genre_ids: [28, 12, 878],
  },
  {
    id: 155, // The Dark Knight
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tWGB2ez9Z6gXmPn36vC6I6g.jpg",
    backdrop_path: "/dqK7P6v6gXmPn36vC6I6g.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    genre_ids: [28, 80, 18],
  },
];
