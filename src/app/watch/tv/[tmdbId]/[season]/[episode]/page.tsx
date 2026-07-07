"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Tv } from "lucide-react";
import Link from "next/link";
import CinemaOSPlayer from "@/components/CinemaOSPlayer";

export default function WatchTVPage() {
  const params = useParams();
  const router = useRouter();

  const tmdbId = params?.tmdbId as string;
  const season = params?.season ? parseInt(params.season as string, 10) : 1;
  const episode = params?.episode ? parseInt(params.episode as string, 10) : 1;

  const [controlsVisible, setControlsVisible] = useState(true);

  // Auto-hide the top bar controls after a few seconds of mouse inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  if (!tmdbId) {
    return (
      <div className="bg-apple-black min-h-screen text-white flex flex-col items-center justify-center p-6">
        <p className="text-sm text-apple-lightGray mb-4">Invalid playback metadata. Return home and try again.</p>
        <Link href="/" className="bg-brand-blue text-white px-6 py-2 rounded-lg font-semibold text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-apple-black min-h-screen text-white flex flex-col relative overflow-hidden select-none">
      {/* Top Floating Bar (auto-hides) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-apple-black/90 to-transparent p-6 flex items-center justify-between transition-opacity duration-500 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors backdrop-blur-md border border-white/5 active:scale-95"
            title="Back to Detail Page"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="text-xs font-bold text-brand-blue uppercase tracking-widest block">
              Now Streaming on Module
            </span>
            <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight">
              TV Show • Season {season}, Episode {episode}
            </h2>
          </div>
        </div>

        {/* Next Episode overlay shortcut */}
        <button
          onClick={() => {
            router.replace(`/watch/tv/${tmdbId}/${season}/${episode + 1}`);
          }}
          className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-md transition-colors active:scale-95"
        >
          <Play size={12} fill="currentColor" />
          <span>Next Episode</span>
        </button>
      </div>

      {/* Immersive Video Screen View */}
      <div className="flex-grow w-full h-screen flex flex-col justify-center items-center">
        <div className="w-full h-full max-w-[1920px] max-h-[1080px] aspect-video">
          <CinemaOSPlayer
            tmdbId={tmdbId}
            mediaType="tv"
            season={season}
            episode={episode}
            autoPlay={true}
          />
        </div>
      </div>
    </div>
  );
}
