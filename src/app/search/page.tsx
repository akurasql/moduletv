"use client";

import React, { useState, useEffect } from "react";
import { Search, Compass, Tv, Film } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [trending, setTrending] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(false);

  // Load trending suggestions initially
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await tmdb.getTrendingAll("week");
        setTrending(data.slice(0, 8));
      } catch (e) {
        console.error(e);
      }
    };
    loadTrending();
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tmdb.searchMulti(query);
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="bg-apple-black min-h-screen text-white pt-24 pb-12">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Search Input Box */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-lightGray" size={20} />
          <input
            type="text"
            placeholder="Search Movies, TV Shows, Genres, Cast..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-apple-darkGray border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-base text-white placeholder-apple-lightGray focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
          />
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center my-12">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results Grid */}
        {query.trim() !== "" && !loading && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-wide">
              Search Results for &ldquo;{query}&rdquo;
            </h2>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {results.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-apple-lightGray text-sm">
                  No matching movies or TV shows found. Try search keywords like &ldquo;Batman&rdquo;, &ldquo;Godzilla&rdquo;, or &ldquo;Marvel&rdquo;.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty Search - Suggest trending searches */}
        {query.trim() === "" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold tracking-wide mb-4">Trending Searches</h2>
              <div className="flex flex-wrap gap-3">
                {["Godzilla", "House of the Dragon", "The Boys", "Mad Max", "Batman", "Star Wars", "Inception", "Interstellar"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="bg-apple-darkGray hover:bg-apple-gray border border-white/5 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {trending.length > 0 && (
              <div>
                <h2 className="text-xl font-bold tracking-wide mb-6">Popular Right Now</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {trending.map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
