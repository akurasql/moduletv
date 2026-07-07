"use client";

import React from "react";
import Link from "next/link";
import { Info, Play } from "lucide-react";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { tmdb } from "@/lib/tmdb";

interface HeroCarouselProps {
  items: (TMDBMovie | TMDBTVShow)[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  // Take first 3 titles for hero carousel rotation / display
  const heroItem = items[0];

  if (!heroItem) return null;

  const title = "title" in heroItem ? heroItem.title : heroItem.name;
  const releaseDate = "release_date" in heroItem ? heroItem.release_date : heroItem.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";
  const mediaType = "title" in heroItem ? "movie" : "tv";

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-apple-black flex items-end">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={tmdb.getImageUrl(heroItem.backdrop_path, "original")}
          alt={title}
          className="w-full h-full object-cover opacity-60 scale-105 animate-[kenburns_40s_ease-out_infinite]"
        />
        {/* Soft bottom-to-transparent scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-apple-black via-apple-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-apple-black/85 via-transparent to-transparent z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-12 pb-16 md:pb-24 w-full">
        <div className="max-w-2xl flex flex-col items-start gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded">
            Featured
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-xs md:text-sm text-apple-lightGray">
            <span>{year}</span>
            <span>•</span>
            <span className="uppercase">{mediaType}</span>
            <span>•</span>
            <span>TMDB ★ {heroItem.vote_average.toFixed(1)}</span>
          </div>
          <p className="text-sm md:text-base text-white/80 line-clamp-3 leading-relaxed">
            {heroItem.overview}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <Link
              href={`/watch/${mediaType}/${heroItem.id}`}
              className="flex items-center gap-2 bg-white text-apple-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all shadow-lg"
            >
              <Play size={16} fill="currentColor" />
              <span>Play</span>
            </Link>
            <Link
              href={`/title/${mediaType}/${heroItem.id}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 px-6 py-2.5 rounded-lg text-sm font-semibold active:scale-95 transition-all backdrop-blur-sm"
            >
              <Info size={16} />
              <span>More Info</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
