import React from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Module - Premium Apple TV Streaming Front-End",
  description: "A gorgeous tvOS & Apple-inspired front-end streaming hub powered by CinemaOS and TMDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-apple-black text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
