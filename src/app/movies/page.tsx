"use client";

import React, { useState, useEffect } from "react";
import { tmdb } from "@/lib/tmdb";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TMDB_GENRES } from "@/lib/constants";

export default function MoviesPage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        if (selectedGenre) {
          const data = await tmdb.discoverMoviesByGenre(selectedGenre);
          setMovies(data);
        } else {
          // default trending movies this week
          const data = await tmdb.getTrendingMovies("week");
          setMovies(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre]);

  return (
    <div className="bg-apple-black min-h-screen text-white pt-24 pb-12">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Movies</h1>
            <p className="text-apple-lightGray text-xs md:text-sm mt-1.5">
              Explore blockbusters, award-winners, and curated selections.
            </p>
          </div>

          {/* Genre Filter Chips */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                selectedGenre === null
                  ? "bg-brand-blue text-white"
                  : "bg-apple-darkGray hover:bg-apple-gray text-apple-lightGray hover:text-white"
              }`}
            >
              All Popular
            </button>
            {TMDB_GENRES.movies.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  selectedGenre === genre.id
                    ? "bg-brand-blue text-white"
                    : "bg-apple-darkGray hover:bg-apple-gray text-apple-lightGray hover:text-white"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinnner */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <MediaCard key={movie.id} item={movie} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
