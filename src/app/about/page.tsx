import React from "react";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="bg-apple-black min-h-screen text-white pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
          About & Legal Disclaimer
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-apple-lightGray">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Product Summary</h2>
            <p>
              Module TV is a high-fidelity, A - TV-inspired web interface designed to showcase premium streaming hub mechanics, state persistence across profiles, and content metadata synchronization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Metadata Attribution</h2>
            <p>
              All movie, TV show, cast, backdrop, and poster metadata used on this application is fetched live from The Movie Database (TMDB). This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Content Playback Disclaimer</h2>
            <p>
              Module TV does not store, self-host, distribute, or stream any of the video files, torrents, or files displayed on the site. All player capabilities are powered externally through third-party iframe embed integrations.
            </p>
            <p>
              Since we operate solely as a metadata aggregator and front-end interface, any questions regarding copyright, licensing, stream quality, or content availability should be directed to the third-party player providers directly.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
