"use client";

import React from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { tmdb } from "@/lib/tmdb";

interface MediaCardProps {
  item: TMDBMovie | TMDBTVShow;
  rank?: number;
}

export function MediaCard({ item, rank }: MediaCardProps) {
  const isMovie = "title" in item;
  const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
  const mediaType = isMovie ? "movie" : "tv";

  return (
    <Link
      href={`/title/${mediaType}/${item.id}`}
      className="group relative flex-none w-[150px] sm:w-[170px] md:w-[190px] lg:w-[210px] transition-transform duration-300 ease-apple-ease hover:scale-[1.04] hover:z-30 cursor-pointer"
    >
      {/* 16:9 Aspect Ratio Container for Landscape Video/Show Cards */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-apple-darkGray shadow-md group-hover:shadow-2xl transition-all duration-300">
        <img
          src={tmdb.getImageUrl(item.backdrop_path || item.poster_path, "w500")}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Soft bottom scrim gradient inside the card to keep title legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-100 transition-opacity duration-300" />
        
        {/* Apple-style continuous thin border */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-xl transition-all pointer-events-none duration-300" />

        {/* Text overlaid directly on the 16:9 landscape layout */}
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <h4 className="text-xs md:text-sm font-bold truncate text-white leading-tight">
            {title}
          </h4>
          <p className="text-[9px] text-apple-lightGray/90 font-medium uppercase tracking-wider mt-0.5">
            {mediaType}
          </p>
        </div>
      </div>

      {/* Numerical Rank Overlay for Top 10 lists */}
      {rank !== undefined && (
        <div className="absolute -left-3 -top-3 z-30 bg-brand-blue text-white w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-lg shadow-black/50 border border-white/10">
          {rank}
        </div>
      )}
    </Link>
  );
}
