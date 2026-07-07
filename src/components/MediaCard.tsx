"use client";

import React from "react";
import Link from "next/link";
import { Plus, Check, Play } from "lucide-react";
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
      className="group relative flex-none w-[160px] md:w-[200px] transition-transform duration-300 ease-apple-ease hover:scale-105 hover:z-30 cursor-pointer"
    >
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-apple-darkGray shadow-md group-hover:shadow-2xl transition-all duration-300">
        <img
          src={tmdb.getImageUrl(item.poster_path, "w500")}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Parallax Lift Focus Frame */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-xl transition-all pointer-events-none duration-300" />
      </div>

      {rank !== undefined && (
        <div className="absolute -left-6 bottom-2 z-10 select-none pointer-events-none">
          <span className="text-[100px] md:text-[140px] font-black leading-none text-apple-black drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)] stroke-white/20">
            {rank}
          </span>
        </div>
      )}

      <div className="mt-2.5">
        <h4 className="text-xs md:text-sm font-semibold truncate text-white/90 group-hover:text-white transition-colors">
          {title}
        </h4>
        <p className="text-[10px] md:text-xs text-apple-lightGray mt-0.5 uppercase tracking-wide">
          {mediaType}
        </p>
      </div>
    </Link>
  );
}
