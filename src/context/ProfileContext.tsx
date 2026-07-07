"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  avatar_color: string | null;
  is_kids: boolean;
  created_at: string;
}

interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  loading: boolean;
  user: any;
  selectProfile: (profile: Profile) => void;
  refreshProfiles: () => Promise<void>;
  createProfile: (displayName: string, avatarColor?: string, isKids?: boolean) => Promise<Profile | null>;
  deleteProfile: (profileId: string) => Promise<void>;
  updateProfile: (profileId: string, updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PRESET_COLORS = [
  "linear-gradient(135deg, #0A84FF, #30D158)",
  "linear-gradient(135deg, #BF5AF2, #FF375F)",
  "linear-gradient(135deg, #FF9F0A, #FF375F)",
  "linear-gradient(135deg, #5E5CE6, #0A84FF)",
  "linear-gradient(135deg, #FFD60A, #FF9F0A)",
  "linear-gradient(135deg, #64D2FF, #0A84FF)",
];

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles(session.user.id);
      } else {
        setProfiles([]);
        setCurrentProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save selected profile to localStorage
  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem("module_profile_id", currentProfile.id);
    }
  }, [currentProfile]);

  const fetchProfiles = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setProfiles(data);
        const storedProfileId = localStorage.getItem("module_profile_id");
        const found = data.find((p) => p.id === storedProfileId);
        if (found) {
          setCurrentProfile(found);
        } else if (data.length > 0) {
          setCurrentProfile(data[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching profiles:", e);
      // Fallback local mock profiles if Supabase credentials are placeholders
      setupLocalMockProfiles();
    } finally {
      setLoading(false);
    }
  };

  const setupLocalMockProfiles = () => {
    const localProfiles: Profile[] = [
      {
        id: "mock-1",
        user_id: "mock-user",
        display_name: "Apple Fan",
        avatar_url: null,
        avatar_color: PRESET_COLORS[0],
        is_kids: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "mock-2",
        user_id: "mock-user",
        display_name: "Kids",
        avatar_url: null,
        avatar_color: PRESET_COLORS[1],
        is_kids: true,
        created_at: new Date().toISOString(),
      }
    ];
    setProfiles(localProfiles);
    const storedProfileId = localStorage.getItem("module_profile_id");
    const found = localProfiles.find((p) => p.id === storedProfileId);
    setCurrentProfile(found || localProfiles[0]);
  };

  const selectProfile = (profile: Profile) => {
    setCurrentProfile(profile);
  };

  const refreshProfiles = async () => {
    if (user) {
      await fetchProfiles(user.id);
    } else {
      setupLocalMockProfiles();
    }
  };

  const createProfile = async (displayName: string, avatarColor?: string, isKids = false): Promise<Profile | null> => {
    const color = avatarColor || PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    
    if (user) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            display_name: displayName,
            avatar_color: color,
            is_kids: isKids,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          await refreshProfiles();
          return data;
        }
      } catch (e) {
        console.error("Error creating database profile:", e);
      }
    }

    // fallback for local storage mode
    const newMock: Profile = {
      id: `mock-${Date.now()}`,
      user_id: "mock-user",
      display_name: displayName,
      avatar_url: null,
      avatar_color: color,
      is_kids: isKids,
      created_at: new Date().toISOString(),
    };
    const updated = [...profiles, newMock];
    setProfiles(updated);
    setCurrentProfile(newMock);
    return newMock;
  };

  const deleteProfile = async (profileId: string) => {
    if (user) {
      try {
        await supabase.from("profiles").delete().eq("id", profileId);
        await refreshProfiles();
        return;
      } catch (e) {
        console.error("Error deleting profile from database:", e);
      }
    }
    const filtered = profiles.filter((p) => p.id !== profileId);
    setProfiles(filtered);
    if (currentProfile?.id === profileId) {
      setCurrentProfile(filtered[0] || null);
    }
  };

  const updateProfile = async (profileId: string, updates: Partial<Profile>) => {
    if (user) {
      try {
        await supabase.from("profiles").update(updates).eq("id", profileId);
        await refreshProfiles();
        return;
      } catch (e) {
        console.error("Error updating profile in database:", e);
      }
    }
    const updated = profiles.map((p) => (p.id === profileId ? { ...p, ...updates } : p));
    setProfiles(updated);
    const found = updated.find((p) => p.id === profileId);
    if (found && currentProfile?.id === profileId) {
      setCurrentProfile(found);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfiles([]);
    setCurrentProfile(null);
    localStorage.removeItem("module_profile_id");
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        loading,
        user,
        selectProfile,
        refreshProfiles,
        createProfile,
        deleteProfile,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
export { PRESET_COLORS };
