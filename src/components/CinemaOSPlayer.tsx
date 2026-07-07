"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Play, RefreshCw, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { supabase } from "@/lib/supabase";

interface CinemaOSPlayerProps {
  tmdbId: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  autoPlay?: boolean;
  title?: string;
}

export function CinemaOSPlayer({
  tmdbId,
  mediaType,
  season = 1,
  episode = 1,
  autoPlay = true,
  title = "Module Video Player",
}: CinemaOSPlayerProps) {
  const router = useRouter();
  const { currentProfile } = useProfile();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Construct source url
  const baseUrl = mediaType === "movie"
    ? `https://cinemaos.tech/player/${tmdbId}`
    : `https://cinemaos.tech/player/${tmdbId}/${season}/${episode}`;

  const queryParams = new URLSearchParams({
    theme: "ffffff",
    autoPlay: autoPlay ? "true" : "false",
    title,
    autoNext: "true",
  });

  const embedUrl = `${baseUrl}?${queryParams.toString()}`;

  useEffect(() => {
    // Record initial watch history entry (fall back to "last opened" tracker)
    const recordWatchHistory = async () => {
      if (!currentProfile) return;

      const profileId = currentProfile.id;
      
      if (supabase && profileId) {
        try {
          const { error } = await supabase.from("watch_history").upsert({
            profile_id: profileId,
            tmdb_id: parseInt(tmdbId, 10),
            media_type: mediaType,
            season: mediaType === "tv" ? season : null,
            episode: mediaType === "tv" ? episode : null,
            last_watched_at: new Date().toISOString(),
          }, {
            onConflict: "profile_id,tmdb_id,media_type,season,episode"
          });

          if (error) throw error;
          setLastSaved(new Date().toLocaleTimeString());
        } catch (e) {
          console.error("Failed to save database watch history:", e);
          // Keep a backup local storage history
          saveLocalHistory();
        }
      } else {
        saveLocalHistory();
      }
    };

    const saveLocalHistory = () => {
      const historyKey = `module_watch_history_${currentProfile?.id || "anonymous"}`;
      const existing = localStorage.getItem(historyKey);
      let list = existing ? JSON.parse(existing) : [];

      // Filter existing item to upsert
      list = list.filter(
        (item: any) =>
          !(item.tmdb_id === tmdbId && item.media_type === mediaType && item.season === season && item.episode === episode)
      );

      list.unshift({
        tmdb_id: tmdbId,
        media_type: mediaType,
        season: mediaType === "tv" ? season : null,
        episode: mediaType === "tv" ? episode : null,
        last_watched_at: new Date().toISOString(),
      });

      localStorage.setItem(historyKey, JSON.stringify(list.slice(0, 30)));
      setLastSaved(new Date().toLocaleTimeString());
    };

    recordWatchHistory();

    // Listen to real-time CinemaOS PostMessage updates
    const handleMessage = (event: MessageEvent) => {
      // Namespace-guard event.origin or standard types
      const allowedOrigins = ["https://cinemaos.tech", "https://cinemaos.live", "https://peachify.top"];
      if (!allowedOrigins.includes(event.origin)) return;

      const data = event.data;
      if (!data) return;

      // CinemaOS / Peachify player structure
      if (data.type === "PLAYER_EVENT") {
        const { event: playerEvent, currentTime, duration } = data.data || {};
        console.log(`[CinemaOS Message] Player ${playerEvent} at ${currentTime}s / ${duration}s`);
        
        // Persist progress_seconds in our local history / DB if desired
        if (currentTime && currentProfile) {
          updateProgressSeconds(Math.floor(currentTime));
        }
      }
    };

    const updateProgressSeconds = async (seconds: number) => {
      if (!currentProfile) return;
      
      const profileId = currentProfile.id;
      if (supabase && profileId) {
        try {
          await supabase.from("watch_history").upsert({
            profile_id: profileId,
            tmdb_id: parseInt(tmdbId, 10),
            media_type: mediaType,
            season: mediaType === "tv" ? season : null,
            episode: mediaType === "tv" ? episode : null,
            progress_seconds: seconds,
            last_watched_at: new Date().toISOString(),
          }, {
            onConflict: "profile_id,tmdb_id,media_type,season,episode"
          });
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [tmdbId, mediaType, season, episode, currentProfile]);

  return (
    <div className="relative w-full h-full bg-apple-black flex flex-col">
      {/* Immersive player wrapper */}
      <div className="relative w-full flex-grow pt-[56.25%] overflow-hidden bg-apple-black shadow-2xl">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="encrypted-media; autoplay"
          title={title}
        />
      </div>

      {/* Sync/Status bar directly beneath player */}
      <div className="bg-apple-nearBlack px-4 py-2 text-[11px] text-apple-lightGray flex justify-between items-center border-t border-white/5">
        <span>CinemaOS Integration •white accent themed player chrome</span>
        {lastSaved && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Saved Progress to Profile: {lastSaved}
          </span>
        )}
      </div>
    </div>
  );
}
export default CinemaOSPlayer;
