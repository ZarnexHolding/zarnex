import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";

/**
 * The standard opening for every non-company page. Void ground, eyebrow,
 * headline, one supporting line — the same rhythm as a company hero so the
 * whole site reads as one system.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section
      data-ground="void"
      className="ground-void flex min-h-[62svh] flex-col justify-end pt-[calc(72px+var(--spacing-section-sm))] pb-[var(--spacing-section-sm)]"
    >
      <div className="shell">
        <Rule className="text-bone" animate={false} />
        <Reveal index={1}>
          <p className="t-eyebrow mt-6 text-paper-45">{eyebrow}</p>
        </Reveal>
        <Reveal index={2} className="mt-10">
          <h1 className="t-display-1 max-w-[15ch]">{title}</h1>
        </Reveal>
        {lead ? (
          <Reveal index={3} className="mt-8">
            <p className="t-body-lg measure text-paper-70">{lead}</p>
          </Reveal>
        ) : null}
        {children}
      </div>
    </section>
  );
}
