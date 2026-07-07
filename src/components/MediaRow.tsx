"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

interface MediaRowProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[];
  isNumbered?: boolean;
}

export function MediaRow({ title, items, isNumbered = false }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative flex flex-col gap-2 group px-6 md:px-12 my-6">
      {/* Title */}
      <h3 className="text-base md:text-lg font-semibold tracking-wide text-white/90">
        {title}
      </h3>

      {/* Container Wrapper */}
      <div className="relative w-full">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-0 top-[35%] -translate-y-1/2 z-40 bg-apple-black/80 hover:bg-apple-black border border-white/5 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-0 top-[35%] -translate-y-1/2 z-40 bg-apple-black/80 hover:bg-apple-black border border-white/5 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
        >
          <ChevronRight size={16} />
        </button>

        {/* Scrolling list */}
        <div
          ref={rowRef}
          className="flex items-start gap-3 md:gap-4 overflow-x-auto scrollbar-none pb-2 px-1 -mx-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item, index) => (
            <div key={item.id} className="snap-start flex-none">
              <MediaCard item={item} rank={isNumbered ? index + 1 : undefined} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default MediaRow;
