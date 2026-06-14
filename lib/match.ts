import { buddies } from "@/data/buddies";

const fallbackBuddy = {
  id: "fallback",
  name: "",
  nickname: "",
  image: "",
  major: "",
  year: "",
  bio: "",
  sharedTags: [],
  hints: [],
  criteriaTitle: "",
  criteriaItems: [],
  orbitLogos: [
    { alt: "Python", src: "/assets/logo/python.png" },
    { alt: "Java", src: "/assets/logo/java.png" },
    { alt: "C++", src: "/assets/logo/c-.png" },
    { alt: "Swift", src: "/assets/logo/swift.png" },
  ],
  matchPercent: 0,
  answerAliases: [],
  greeting: "",
  contactLabel: "",
  contactHref: "",
  palette: { accent: "#456731", accentSoft: "#8fb677", outline: "#456731" },
};

export function sanitizeCode(input: string | null) {
  const cleaned = (input ?? "").replace(/\D/g, "").slice(0, 4);
  return cleaned.length === 4 ? cleaned : null;
}

export function getBuddyFromCode(input: string | null) {
  const code = sanitizeCode(input);
  return {
    code: code ?? "",
    buddy: fallbackBuddy
  };
}
