"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Film, Tv, Compass, User, LogOut, ChevronDown, Check, Plus, UserPlus } from "lucide-react";
import { useProfile, PRESET_COLORS } from "@/context/ProfileContext";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profiles, currentProfile, user, selectProfile, signOut } = useProfile();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Compass },
    { name: "Movies", href: "/movies", icon: Film },
    { name: "TV Shows", href: "/shows", icon: Tv },
    { name: "Search", href: "/search", icon: Search },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-apple-black/90 backdrop-blur-md border-b border-white/5" : "bg-gradient-to-b from-apple-black/80 to-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-brand-blue text-white w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm">M</span>
            <span>Module</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-colors ${
                    isActive ? "text-brand-blue" : "text-apple-lightGray hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile / Right Section */}
        <div className="flex items-center gap-4">
          {currentProfile ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-mono"
                  style={{
                    background: currentProfile.avatar_color || PRESET_COLORS[0],
                  }}
                >
                  {currentProfile.display_name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className="text-apple-lightGray" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-apple-darkGray border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs text-apple-lightGray">Signed in as</p>
                    <p className="text-sm font-medium truncate text-white">
                      {currentProfile.display_name}
                    </p>
                  </div>

                  {/* Profile Switcher */}
                  <div className="py-2 border-b border-white/5">
                    <p className="px-4 py-1 text-xs text-apple-lightGray font-semibold uppercase tracking-wider">
                      Switch Profile
                    </p>
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          selectProfile(p);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ background: p.avatar_color || PRESET_COLORS[0] }}
                          >
                            {p.display_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-white truncate">{p.display_name}</span>
                        </div>
                        {currentProfile.id === p.id && (
                          <Check size={14} className="text-brand-blue" />
                        )}
                      </button>
                    ))}
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors text-left text-sm text-brand-blue"
                    >
                      <UserPlus size={14} />
                      <span>Manage Profiles</span>
                    </Link>
                  </div>

                  {/* Settings & Sign Out */}
                  <div className="pt-2">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors text-left text-sm text-white"
                    >
                      <User size={14} className="text-apple-lightGray" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setProfileDropdownOpen(false);
                        router.push("/login");
                      }}
                      className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors text-left text-sm text-red-500"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-white bg-brand-blue px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-apple-black/95 border-t border-white/5 h-16 flex items-center justify-around px-4 z-50">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? "text-brand-blue" : "text-apple-lightGray hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
export default Navbar;
