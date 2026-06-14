"use client";

import { SeniorProfile } from "@/lib/senior/types";

const storageKey = "buddy-match-next-senior-profiles-v1";

export function readSeniorProfiles() {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return {} as Record<string, SeniorProfile>;
  }

  try {
    return JSON.parse(raw) as Record<string, SeniorProfile>;
  } catch {
    return {} as Record<string, SeniorProfile>;
  }
}

export function writeSeniorProfile(profile: SeniorProfile) {
  const current = readSeniorProfiles();
  current[profile.seniorId] = profile;
  window.localStorage.setItem(storageKey, JSON.stringify(current));
}

export function getOpenSeniorProfiles() {
  return Object.values(readSeniorProfiles()).filter(
    (profile) => profile.hints.filter((hint) => hint.trim()).length >= 1
  );
}
