import { CircleUserRound } from "lucide-react";
import { TransitionLink } from "@/components/layout/transition-link";

export function SiteHeader() {
  return (
    <header className="site-shell site-header">
      <TransitionLink href="/" className="brand-mark">
        CodeLineageสายเลือดโค้ด
      </TransitionLink>
      <div className="header-actions">
        <button className="icon-button" aria-label="Profile">
          <CircleUserRound size={22} strokeWidth={2.3} />
        </button>
      </div>
    </header>
  );
}
