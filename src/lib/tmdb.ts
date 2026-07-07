import { TMDBMovie, TMDBTVShow, TMDBSeason, TMDBEpisode } from "@/types/tmdb";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

function getUrl(endpoint: string, queryParams: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${TMDB_API_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  
  Object.entries(queryParams).forEach(([key, val]) => {
    if (val !== undefined) {
      url.searchParams.set(key, String(val));
    }
  });
  
  return url.toString();
}

async function tmdbFetch<T>(endpoint: string, queryParams: Record<string, string | number | undefined> = {}, revalidate = 3600): Promise<T> {
  const url = getUrl(endpoint, queryParams);
  
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set in environment variables.");
  }
  
  const res = await fetch(url, {
    next: { revalidate },
  });
  
  if (!res.ok) {
    throw new Error(`TMDB Fetch failed for ${endpoint}: ${res.statusText}`);
  }
  
  return res.json() as Promise<T>;
}

export const tmdb = {
  getTrendingAll: async (timeWindow: "day" | "week" = "week") => {
    try {
      const data = await tmdbFetch<{ results: (TMDBMovie | TMDBTVShow)[] }>(`/trending/all/${timeWindow}`);
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getTrendingMovies: async (timeWindow: "day" | "week" = "day") => {
    try {
      const data = await tmdbFetch<{ results: TMDBMovie[] }>(`/trending/movie/${timeWindow}`);
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getTrendingTV: async (timeWindow: "day" | "week" = "day") => {
    try {
      const data = await tmdbFetch<{ results: TMDBTVShow[] }>(`/trending/tv/${timeWindow}`);
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getMoviesByFilter: async (filter: "popular" | "top_rated" | "upcoming" | "now_playing" | "2026") => {
    try {
      if (filter === "2026") {
        const data = await tmdbFetch<{ results: TMDBMovie[] }>("/discover/movie", {
          primary_release_year: 2026,
          sort_by: "popularity.desc",
        });
        return data.results;
      }
      const data = await tmdbFetch<{ results: TMDBMovie[] }>(`/movie/${filter}`);
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getTVByFilter: async (filter: "popular" | "top_rated" | "airing_today" | "on_the_air" | "2026") => {
    try {
      if (filter === "2026") {
        const data = await tmdbFetch<{ results: TMDBTVShow[] }>("/discover/tv", {
          first_air_date_year: 2026,
          sort_by: "popularity.desc",
        });
        return data.results;
      }
      const data = await tmdbFetch<{ results: TMDBTVShow[] }>(`/tv/${filter}`);
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  discoverMoviesByGenre: async (genreId: number) => {
    try {
      const data = await tmdbFetch<{ results: TMDBMovie[] }>("/discover/movie", {
        with_genres: genreId,
        sort_by: "popularity.desc",
      });
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  discoverTVByGenre: async (genreId: number) => {
    try {
      const data = await tmdbFetch<{ results: TMDBTVShow[] }>("/discover/tv", {
        with_genres: genreId,
        sort_by: "popularity.desc",
      });
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getMovieDetail: async (id: number): Promise<TMDBMovie | null> => {
    try {
      const data = await tmdbFetch<TMDBMovie>(`/movie/${id}`, {
        append_to_response: "credits,recommendations",
      });
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getTVDetail: async (id: number): Promise<TMDBTVShow | null> => {
    try {
      const data = await tmdbFetch<TMDBTVShow>(`/tv/${id}`, {
        append_to_response: "credits,recommendations",
      });
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getTVSeason: async (id: number, seasonNumber: number): Promise<TMDBSeason | null> => {
    try {
      return await tmdbFetch<TMDBSeason>(`/tv/${id}/season/${seasonNumber}`);
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getRecommendations: async (type: "movie" | "tv", id: number) => {
    try {
      const data = await tmdbFetch<{ results: (TMDBMovie | TMDBTVShow)[] }>(`/${type}/${id}/recommendations`);
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  searchMulti: async (query: string): Promise<(TMDBMovie | TMDBTVShow)[]> => {
    try {
      const data = await tmdbFetch<{ results: (TMDBMovie | TMDBTVShow)[] }>("/search/multi", {
        query,
      });
      return data.results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  
  getImageUrl: (path: string | null, size: "w500" | "w780" | "original" = "w500") => {
    if (!path) return "/placeholder-poster.png";
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
};
