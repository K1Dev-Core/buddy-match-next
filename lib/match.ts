import { buddies } from "@/data/buddies";

export function sanitizeCode(input: string | null) {
  const cleaned = (input ?? "").replace(/\D/g, "").slice(0, 4);
  return cleaned.length === 4 ? cleaned : "2408";
}

export function getBuddyFromCode(input: string | null) {
  const code = sanitizeCode(input);
  const index = code
    .split("")
    .map(Number)
    .reduce((sum, digit) => sum + digit, 0) % buddies.length;
  return {
    code,
    buddy: buddies[index]
  };
}
