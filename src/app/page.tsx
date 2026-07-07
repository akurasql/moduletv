"use client";

import React, { useEffect, useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import { tmdb } from "@/lib/tmdb";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MediaRow } from "@/components/MediaRow";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const { currentProfile } = useProfile();
  
  const [featured, setFeatured] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [topMovies, setTopMovies] = useState<TMDBMovie[]>([]);
  const [topTV, setTopTV] = useState<TMDBTVShow[]>([]);
  const [watchlist, setWatchlist] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [actionMovies, setActionMovies] = useState<TMDBMovie[]>([]);
  const [comedyShows, setComedyShows] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Main Catalog Content
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [
          allTrending,
          trendingMovies,
          trendingTV,
          moviesAction,
          tvComedy,
        ] = await Promise.all([
          tmdb.getTrendingAll("week"),
          tmdb.getTrendingMovies("day"),
          tmdb.getTrendingTV("day"),
          tmdb.discoverMoviesByGenre(28), // Action
          tmdb.discoverTVByGenre(35), // Comedy
        ]);

        setFeatured(allTrending.slice(0, 5));
        setTopMovies(trendingMovies);
        setTopTV(trendingTV);
        setActionMovies(moviesAction);
        setComedyShows(tvComedy);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  // Load Up Next / Watchlist custom per profile
  useEffect(() => {
    if (!currentProfile) return;

    const loadWatchlist = async () => {
      // For local fallback or database watchlist
      const key = `module_watchlist_${currentProfile.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const list: (TMDBMovie | TMDBTVShow)[] = [];
          
          for (const item of parsed) {
            const detail = item.media_type === "movie" 
              ? await tmdb.getMovieDetail(parseInt(item.tmdb_id, 10))
              : await tmdb.getTVDetail(parseInt(item.tmdb_id, 10));
            if (detail) {
              list.push(detail);
            }
          }
          setWatchlist(list);
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadWatchlist();
  }, [currentProfile]);

  if (loading) {
    return (
      <div className="bg-apple-black min-h-screen text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-apple-black min-h-screen text-white pb-12 overflow-x-hidden">
      <Navbar />

      {/* Featured Hero Backdrop Showcase */}
      {featured.length > 0 && <HeroCarousel items={featured} />}

      {/* Rows Showcase wrapper */}
      <div className="relative z-20 space-y-4 -mt-16 md:-mt-24">
        
        {/* Continue Watching / Up Next (Watchlist Row) */}
        {watchlist.length > 0 && (
          <MediaRow title="Up Next (Your Watchlist)" items={watchlist} />
        )}

        {/* Top 10 Charts */}
        {topMovies.length > 0 && (
          <MediaRow title="Top 10 Movies Today" items={topMovies} isNumbered={true} />
        )}

        {topTV.length > 0 && (
          <MediaRow title="Top 10 TV Shows Today" items={topTV} isNumbered={true} />
        )}

        {/* Genre curation collections */}
        {actionMovies.length > 0 && (
          <MediaRow title="Action Blockbusters" items={actionMovies} />
        )}

        {comedyShows.length > 0 && (
          <MediaRow title="Hilarious TV Comedies" items={comedyShows} />
        )}
      </div>

      <Footer />
    </div>
  );
}
