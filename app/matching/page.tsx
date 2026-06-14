import { DecorLayer } from "@/components/layout/decor-layer";
import { MatchingGuard } from "@/components/matching/matching-guard";

type MatchingPageProps = {
  searchParams: Promise<{
    t?: string;
  }>;
};

export default async function MatchingPage({ searchParams }: MatchingPageProps) {
  const params = await searchParams;

  return (
    <main className="page-shell centered-shell">
      <DecorLayer mode="matching" />
      <MatchingGuard token={params.t ?? null} />
    </main>
  );
}
