export type Buddy = {
  id: string;
  name: string;
  nickname: string;
  image: string;
  major: string;
  year: string;
  bio: string;
  sharedTags: string[];
  hints: string[];
  criteriaTitle: string;
  criteriaItems: string[];
  orbitLogos: Array<{
    alt: string;
    src: string;
  }>;
  matchPercent: number;
  answerAliases: string[];
  greeting: string;
  contactLabel: string;
  contactHref: string;
  palette: {
    accent: string;
    accentSoft: string;
    outline: string;
  };
};
