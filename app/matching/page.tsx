import { DecorLayer } from "@/components/layout/decor-layer";
import { MatchingExperience } from "@/components/matching/matching-experience";

type MatchingPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function MatchingPage({ searchParams }: MatchingPageProps) {
  const params = await searchParams;

  return (
    <main className="page-shell centered-shell">
      <DecorLayer mode="matching" />
      <MatchingExperience code={params.code ?? null} />
    </main>
  );
}
