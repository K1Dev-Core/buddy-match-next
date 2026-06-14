import { HeroShell } from "@/components/home/hero-shell";
import { OtpFlow } from "@/components/home/otp-flow";
import { DecorLayer } from "@/components/layout/decor-layer";
import { SiteHeader } from "@/components/layout/site-header";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="page-shell">
      <DecorLayer mode="home" />
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <div className="site-shell page-main">
        <HeroShell>
          <OtpFlow />
        </HeroShell>
      </div>
    </main>
  );
}
