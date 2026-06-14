import { DecorLayer } from "@/components/layout/decor-layer";
import { RevealExperience } from "@/components/reveal/reveal-experience";

type RevealPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function RevealPage({ searchParams }: RevealPageProps) {
  const params = await searchParams;

  return (
    <main className="page-shell centered-shell">
      <DecorLayer mode="reveal" />
      <RevealExperience code={params.code ?? null} />
    </main>
  );
}
