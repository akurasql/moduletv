import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-apple-black border-t border-white/5 py-12 px-6 md:px-12 mt-20">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-apple-lightGray">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-white text-sm">Module TV</p>
          <p className="max-w-md leading-relaxed">
            Module is a premium front-end streaming hub mirroring Apple&apos;s API principles. Sourced by COS & TMDB API.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:text-right max-w-sm">
          <p className="text-white font-medium">Attribution & Legal</p>
          <p className="leading-relaxed">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
            Module TV is a content aggregator front-end. It does not host, upload, or store any video files. All playback is sourced externally.
          </p>
          <Link href="/about" className="text-brand-blue hover:underline">
            About & Legal Disclaimer
          </Link>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto text-center border-t border-white/5 mt-8 pt-6 text-[11px] text-white/40">
        &copy; {new Date().getFullYear()} Module TV. All rights reserved. Designed by M3D Industries.
      </div>
    </footer>
  );
}
export default Footer;
