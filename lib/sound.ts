"use client";

const audioCache = new Map<string, HTMLAudioElement>();

export function playSound(path: string) {
  try {
    let audio = audioCache.get(path);
    if (!audio) {
      audio = new Audio(path);
      audioCache.set(path, audio);
    }
    audio.currentTime = 0;
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    /* audio blocked by browser policy */
  }
}
