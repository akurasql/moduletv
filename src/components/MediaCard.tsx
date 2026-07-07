"use client";

import React from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { tmdb } from "@/lib/tmdb";

interface MediaCardProps {
  item: TMDBMovie | TMDBTVShow;
  rank?: number;
  isHomeCard?: boolean;
}

export function MediaCard({ item, rank, isHomeCard = false }: MediaCardProps) {
  const isMovie = "title" in item;
  const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
  const mediaType = isMovie ? "movie" : "tv";

  // Force strict sizes using pixel-exact styles to ensure cards fit perfectly and prevent full-width stretching
  const cardStyle = isHomeCard
    ? { width: "110px", minWidth: "110px", maxWidth: "110px" }
    : { width: "150px", minWidth: "150px", maxWidth: "150px" };

  return (
    <Link
      href={`/title/${mediaType}/${item.id}`}
      style={cardStyle}
      className="group relative flex-none block transition-transform duration-300 ease-apple-ease hover:scale-105 hover:z-30 cursor-pointer"
    >
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-apple-darkGray shadow-md group-hover:shadow-2xl transition-all duration-300">
        <img
          src={tmdb.getImageUrl(item.poster_path, "w500")}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Parallax continuous highlight overlay */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/15 rounded-lg transition-all pointer-events-none duration-300" />
      </div>

      {rank !== undefined && (
        <div className="absolute -left-2 bottom-0 z-10 select-none pointer-events-none">
          <span className="text-[35px] md:text-[45px] font-black leading-none text-apple-black drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] stroke-white/10">
            {rank}
          </span>
        </div>
      )}

      <div className="mt-1 px-0.5">
        <h4 className="text-[10px] md:text-[11px] font-semibold truncate text-white/90 group-hover:text-white transition-colors">
          {title}
        </h4>
        <p className="text-[8px] text-apple-lightGray uppercase tracking-wider mt-0.5">
          {mediaType}
        </p>
      </div>
    </Link>
  );
}
export default MediaCard;
