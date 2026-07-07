"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile, PRESET_COLORS } from "@/context/ProfileContext";
import { Plus, Trash2, Edit2, Check, ArrowLeft, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { profiles, currentProfile, user, createProfile, deleteProfile, updateProfile, selectProfile, signOut } = useProfile();
  const [isEditing, setIsScrolled] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isKids, setIsKids] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    await createProfile(newProfileName, selectedColor, isKids);
    setNewProfileName("");
    setIsKids(false);
    setShowAddForm(false);
  };

  return (
    <div className="bg-apple-black min-h-screen text-white pt-24 pb-12 flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
          Who&apos;s Watching?
        </h1>
        <p className="text-apple-lightGray text-sm md:text-base mb-10">
          Select a profile to customize your Up Next, watchlist, and personalized recommendations.
        </p>

        {/* Profiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-center items-center max-w-xl mx-auto mb-12">
          {profiles.map((p) => {
            const isSelected = currentProfile?.id === p.id;
            return (
              <div key={p.id} className="group flex flex-col items-center gap-3">
                <button
                  onClick={() => selectProfile(p)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold font-mono transition-all duration-300 relative ${
                    isSelected
                      ? "ring-4 ring-brand-blue ring-offset-4 ring-offset-apple-black scale-105"
                      : "opacity-75 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ background: p.avatar_color || PRESET_COLORS[0] }}
                >
                  {p.display_name.charAt(0).toUpperCase()}
                  {isSelected && (
                    <div className="absolute -bottom-1 -right-1 bg-brand-blue rounded-full p-1 border border-apple-black shadow-lg">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {p.display_name}
                  </span>
                  {p.is_kids && (
                    <span className="text-[9px] bg-white/10 text-brand-blue px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-90">
                      Kids
                    </span>
                  )}
                </div>

                {profiles.length > 1 && (
                  <button
                    onClick={() => deleteProfile(p.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-xs transition-opacity duration-300 flex items-center gap-1 mt-1"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Profile Trigger */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-white/20 hover:border-white/50 flex items-center justify-center text-apple-lightGray hover:text-white transition-all duration-300">
                <Plus size={32} />
              </div>
              <span className="text-sm font-medium text-apple-lightGray hover:text-white transition-colors">
                Add Profile
              </span>
            </button>
          )}
        </div>

        {/* Add Profile Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreate}
            className="max-w-md mx-auto bg-apple-darkGray p-6 rounded-2xl border border-white/10 text-left space-y-4 mb-8"
          >
            <h3 className="text-lg font-semibold text-white">Create New Profile</h3>
            
            <div className="space-y-1">
              <label className="text-xs text-apple-lightGray font-semibold uppercase tracking-wider">
                Profile Name
              </label>
              <input
                type="text"
                placeholder="e.g. My Apple TV Profile"
                required
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full bg-apple-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue transition-colors"
              />
            </div>

            {/* Avatar Color Picker */}
            <div className="space-y-1.5">
              <label className="text-xs text-apple-lightGray font-semibold uppercase tracking-wider block">
                Avatar Customization / Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      selectedColor === color ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            {/* Kids Profile Switch */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold">Kids Profile</p>
                <p className="text-xs text-apple-lightGray">Restricts maturity rating limits</p>
              </div>
              <input
                type="checkbox"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-grow bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                Create Profile
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-brand-blue font-semibold hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Go to Home Page</span>
          </button>
          {user && (
            <button
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              className="flex items-center gap-2 text-sm text-red-500 font-semibold hover:underline border-l border-white/10 pl-4"
            >
              <LogOut size={16} />
              <span>Sign Out Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
