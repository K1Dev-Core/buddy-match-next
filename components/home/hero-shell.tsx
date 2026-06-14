import Image from "next/image";
import { ReactNode } from "react";

type HeroShellProps = {
  children: ReactNode;
};

export function HeroShell({ children }: HeroShellProps) {
  return (
    <section className="hero-shell">
      <aside className="hero-character hero-character-left">
        <div className="character-frame mint">
          <Image
            src="/assets/characters/deer.png"
            alt="Deer buddy"
            fill
            sizes="(max-width: 1024px) 180px, 260px"
          />
        </div>
      </aside>
      <div className="hero-content">{children}</div>
      <aside className="hero-character hero-character-right">
        <div className="character-frame orange">
          <Image
            src="/assets/characters/leopard.png"
            alt="Leopard buddy"
            fill
            sizes="(max-width: 1024px) 180px, 280px"
          />
        </div>
      </aside>
    </section>
  );
}
