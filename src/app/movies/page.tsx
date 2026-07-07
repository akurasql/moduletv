"use client";

import React, { useState, useEffect } from "react";
import { tmdb } from "@/lib/tmdb";
import { TMDBMovie } from "@/types/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TMDB_GENRES } from "@/lib/constants";

type FilterType = "popular" | "top_rated" | "upcoming" | "2026" | "now_playing";

export default function MoviesPage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        if (selectedGenre) {
          const data = await tmdb.discoverMoviesByGenre(selectedGenre);
          setMovies(data);
        } else {
          const data = await tmdb.getMoviesByFilter(selectedFilter);
          setMovies(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre, selectedFilter]);

  const filters: { value: FilterType; label: string }[] = [
    { value: "popular", label: "Best Of (Popular)" },
    { value: "upcoming", label: "New On" },
    { value: "2026", label: "2026 Releases" },
    { value: "top_rated", label: "Top Rated" },
    { value: "now_playing", label: "Now Playing" },
  ];

  return (
    <div className="bg-apple-black min-h-screen text-white pt-24 pb-12">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Header & Filter Controls */}
        <div className="flex flex-col gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Movies</h1>
            <p className="text-apple-lightGray text-xs md:text-sm mt-1.5">
              Explore thousands of titles matched automatically to the CinemaOS embed player.
            </p>
          </div>

          {/* Quick Filters Segmented Control */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setSelectedGenre(null);
                  setSelectedFilter(f.value);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  selectedFilter === f.value && selectedGenre === null
                    ? "bg-brand-blue text-white"
                    : "bg-apple-darkGray hover:bg-apple-gray text-apple-lightGray hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Genre Filter Chips */}
          <div className="flex flex-wrap gap-2.5">
            <span className="text-xs text-apple-lightGray flex items-center font-bold uppercase tracking-wider mr-2">
              Genres:
            </span>
            {TMDB_GENRES.movies.map((genre) => (
              <button
                key={genre.id}
                onClick={() => {
                  setSelectedFilter("popular");
                  setSelectedGenre(genre.id);
                }}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedGenre === genre.id
                    ? "bg-white text-apple-black font-semibold"
                    : "bg-apple-darkGray/60 hover:bg-apple-gray text-apple-lightGray hover:text-white border border-white/5"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
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
