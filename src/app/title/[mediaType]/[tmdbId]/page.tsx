"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Plus, Check, Star, RefreshCw } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { TMDBMovie, TMDBTVShow, TMDBSeason, TMDBEpisode } from "@/types/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/context/ProfileContext";
import { supabase } from "@/lib/supabase";
import { MediaRow } from "@/components/MediaRow";
import Link from "next/link";

export default function TitleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProfile } = useProfile();

  const mediaType = params?.mediaType as "movie" | "tv";
  const tmdbId = params?.tmdbId as string;

  const [movieData, setMovieData] = useState<TMDBMovie | null>(null);
  const [tvData, setTVData] = useState<TMDBTVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  // TV show specific states
  const [seasonsCount, setSeasonsCount] = useState<number>(0);
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<TMDBSeason | null>(null);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<(TMDBMovie | TMDBTVShow)[]>([]);

  // Load title detail metadata
  useEffect(() => {
    if (!tmdbId || !mediaType) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const idNum = parseInt(tmdbId, 10);
        if (mediaType === "movie") {
          const data = await tmdb.getMovieDetail(idNum);
          setMovieData(data);
          if (data && "recommendations" in data) {
            setRecommendations((data as any).recommendations?.results?.slice(0, 8) || []);
          }
        } else {
          const data = await tmdb.getTVDetail(idNum);
          setTVData(data);
          if (data) {
            setSeasonsCount(data.number_of_seasons || 1);
            if ("recommendations" in data) {
              setRecommendations((data as any).recommendations?.results?.slice(0, 8) || []);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tmdbId, mediaType]);

  // Load selected TV season details
  useEffect(() => {
    if (mediaType !== "tv" || !tmdbId) return;

    const loadSeason = async () => {
      setEpisodesLoading(true);
      try {
        const data = await tmdb.getTVSeason(parseInt(tmdbId, 10), selectedSeasonNum);
        setSeasonDetails(data);
      } catch (e) {
        console.error(e);
      } finally {
        setEpisodesLoading(false);
      }
    };

    loadSeason();
  }, [selectedSeasonNum, mediaType, tmdbId]);

  // Check Watchlist status
  useEffect(() => {
    if (!currentProfile || !tmdbId || !mediaType) return;

    const checkWatchlist = async () => {
      const profileId = currentProfile.id;
      if (supabase && profileId) {
        try {
          const { data, error } = await supabase
            .from("watchlist")
            .select("*")
            .eq("profile_id", profileId)
            .eq("tmdb_id", parseInt(tmdbId, 10))
            .eq("media_type", mediaType);

          if (data && data.length > 0) {
            setInWatchlist(true);
          } else {
            setInWatchlist(false);
          }
        } catch (e) {
          // fallback to localStorage
          checkLocalWatchlist();
        }
      } else {
        checkLocalWatchlist();
      }
    };

    const checkLocalWatchlist = () => {
      const key = `module_watchlist_${currentProfile.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const list = JSON.parse(saved);
        const exists = list.some(
          (item: any) => item.tmdb_id === tmdbId && item.media_type === mediaType
        );
        setInWatchlist(exists);
      }
    };

    checkWatchlist();
  }, [currentProfile, tmdbId, mediaType]);

  const toggleWatchlist = async () => {
    if (!currentProfile) {
      router.push("/login");
      return;
    }

    const profileId = currentProfile.id;
    const itemNum = parseInt(tmdbId, 10);

    if (supabase && profileId) {
      try {
        if (inWatchlist) {
          await supabase
            .from("watchlist")
            .delete()
            .eq("profile_id", profileId)
            .eq("tmdb_id", itemNum)
            .eq("media_type", mediaType);
          setInWatchlist(false);
        } else {
          await supabase.from("watchlist").insert({
            profile_id: profileId,
            tmdb_id: itemNum,
            media_type: mediaType,
          });
          setInWatchlist(true);
        }
        return;
      } catch (e) {
        console.error("Database watchlist sync failed, using local storage fallback", e);
      }
    }

    // Local Storage fallback
    const key = `module_watchlist_${currentProfile.id}`;
    const saved = localStorage.getItem(key);
    let list = saved ? JSON.parse(saved) : [];

    if (inWatchlist) {
      list = list.filter((i: any) => !(i.tmdb_id === tmdbId && i.media_type === mediaType));
      setInWatchlist(false);
    } else {
      list.push({ tmdb_id: tmdbId, media_type: mediaType });
      setInWatchlist(true);
    }
    localStorage.setItem(key, JSON.stringify(list));
  };

  if (loading) {
    return (
      <div className="bg-apple-black min-h-screen text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const data = mediaType === "movie" ? movieData : tvData;
  if (!data) {
    return (
      <div className="bg-apple-black min-h-screen text-white flex flex-col items-center justify-center p-6">
        <p className="text-sm text-apple-lightGray mb-4">Metadata missing or title not found on TMDB.</p>
        <Link href="/" className="bg-brand-blue text-white px-6 py-2 rounded-lg font-semibold text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  const title = mediaType === "movie" ? (data as TMDBMovie).title : (data as TMDBTVShow).name;
  const rating = data.vote_average.toFixed(1);
  const releaseDate = mediaType === "movie" ? (data as TMDBMovie).release_date : (data as TMDBTVShow).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  const genres = data.genres?.map((g) => g.name).join(", ") || "";
  const tagline = data.tagline || "";
  const cast = data.credits?.cast?.slice(0, 10) || [];

  return (
    <div className="bg-apple-black min-h-screen text-white pb-12">
      <Navbar />

      {/* Hero Header Area */}
      <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={tmdb.getImageUrl(data.backdrop_path, "original")}
            alt={title}
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          {/* Subtle vignette and clean scrim gradient over image backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-apple-black via-apple-black/30 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-apple-black/80 via-transparent to-transparent z-10" />
        </div>

        {/* Hero Title & Description Details */}
        <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-12 pb-12 w-full">
          <div className="max-w-3xl flex flex-col items-start gap-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-white">
              {title}
            </h1>

            {tagline && (
              <p className="text-brand-blue font-medium italic text-sm md:text-base tracking-wide">
                &ldquo;{tagline}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-apple-lightGray">
              <span className="bg-white/10 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                TMDB {rating}
              </span>
              <span>{year}</span>
              <span>•</span>
              <span className="uppercase">{mediaType}</span>
              {mediaType === "movie" && (data as TMDBMovie).runtime && (
                <>
                  <span>•</span>
                  <span>{(data as TMDBMovie).runtime} mins</span>
                </>
              )}
              <span>•</span>
              <span className="truncate max-w-[200px]">{genres}</span>
            </div>

            <p className="text-sm md:text-base text-white/95 leading-relaxed font-normal">
              {data.overview}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mt-3">
              <Link
                href={mediaType === "movie" ? `/watch/movie/${tmdbId}` : `/watch/tv/${tmdbId}/1/1`}
                className="flex items-center gap-2 bg-white text-apple-black hover:bg-white/90 px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all shadow-xl active:scale-95"
              >
                <Play size={16} fill="currentColor" />
                <span>Play Now</span>
              </Link>

              <button
                onClick={toggleWatchlist}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
              >
                {inWatchlist ? <Check size={16} className="text-brand-blue" /> : <Plus size={16} />}
                <span>{inWatchlist ? "In Up Next" : "Add to Up Next"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-12 space-y-12">
        {/* Cast & Crew Section */}
        {cast.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white/95">
              Cast & Crew
            </h2>
            <div className="flex items-start gap-6 overflow-x-auto pb-4 scrollbar-none">
              {cast.map((member) => (
                <div key={member.id} className="flex-none w-24 md:w-28 text-center space-y-2">
                  <div className="w-16 h-16 md:w-20 md:h-24 mx-auto rounded-xl overflow-hidden bg-apple-darkGray shadow">
                    <img
                      src={tmdb.getImageUrl(member.profile_path, "w500")}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                    <p className="text-[10px] text-apple-lightGray truncate leading-tight">
                      {member.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TV Series Episode & Seasons Section */}
        {mediaType === "tv" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-extrabold tracking-tight">Episodes</h2>
              
              {/* Season Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-apple-lightGray uppercase font-bold tracking-wider">
                  Season:
                </span>
                <select
                  value={selectedSeasonNum}
                  onChange={(e) => setSelectedSeasonNum(parseInt(e.target.value, 10))}
                  className="bg-apple-darkGray text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-blue"
                >
                  {Array.from({ length: seasonsCount }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Season {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Episode Grid/List */}
            {episodesLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seasonDetails?.episodes?.map((ep) => (
                  <div
                    key={ep.id}
                    className="bg-apple-darkGray/60 border border-white/5 rounded-2xl p-4 flex gap-4 hover:bg-apple-darkGray/90 transition-all group relative"
                  >
                    {/* Ep Thumbnail / Poster box */}
                    <div className="relative w-32 md:w-40 aspect-video rounded-xl overflow-hidden bg-apple-black flex-none">
                      <img
                        src={tmdb.getImageUrl(ep.still_path, "w500")}
                        alt={ep.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Hover Play overlay */}
                      <Link
                        href={`/watch/tv/${tmdbId}/${selectedSeasonNum}/${ep.episode_number}`}
                        className="absolute inset-0 bg-apple-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play size={20} className="text-white" fill="currentColor" />
                      </Link>
                    </div>

                    {/* Metadata */}
                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block">
                          Episode {ep.episode_number}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-blue transition-colors">
                          {ep.name}
                        </h4>
                        <p className="text-xs text-apple-lightGray line-clamp-2 mt-1 leading-normal">
                          {ep.overview || "No description overview available for this episode."}
                        </p>
                      </div>
                      <span className="text-[10px] text-apple-lightGray mt-2 block">
                        Aired: {ep.air_date ? new Date(ep.air_date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* More Like This (Recommendations Row) */}
        {recommendations.length > 0 && (
          <MediaRow title="More Like This" items={recommendations} />
        )}
      </div>

      <Footer />
    </div>
  );
}
