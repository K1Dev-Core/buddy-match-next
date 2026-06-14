import { DecorLayer } from "@/components/layout/decor-layer";
import { RevealExperience } from "@/components/reveal/reveal-experience";

type RevealPageProps = {
  searchParams: Promise<{
    t?: string;
  }>;
};

export default async function RevealPage({ searchParams }: RevealPageProps) {
  const params = await searchParams;

  return (
    <main className="page-shell centered-shell">
      <DecorLayer mode="reveal" />
      <RevealExperience token={params.t ?? null} />
    </main>
  );
}
