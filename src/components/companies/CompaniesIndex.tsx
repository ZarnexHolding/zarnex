"use client";

import { useCallback, useMemo, useState } from "react";
import { CompanyCard } from "@/components/ui/CompanyCard";
import { Reveal } from "@/components/motion/Reveal";
import { COMPANIES, SECTORS, type Company } from "@/lib/companies";
import { cn } from "@/lib/cn";

/**
 * The index. A calm grid — this page's job is scanning, and the restraint is
 * deliberate: it is the breath between the homepage constellation and a
 * company page's hero.
 *
 * Filtering is client-side over an already server-rendered list, so it costs
 * no navigation and works without JS (unfiltered). The choice is mirrored into
 * the URL with replaceState, which keeps views shareable without pushing a
 * history entry per click.
 */

/** Only sectors that actually contain a company — derived, never listed. */
const ACTIVE_SECTORS = SECTORS.filter((s) =>
  COMPANIES.some((c) => c.sectors.includes(s.n)),
);

/** "Real Estate, Urban Development & City Planning" -> "Real Estate" */
function shortLabel(name: string) {
  return name.split(/[,&]/)[0].trim();
}

export function CompaniesIndex({ initialSector }: { initialSector: number | null }) {
  const [sector, setSector] = useState<number | null>(initialSector);

  const visible = useMemo<Company[]>(
    () => (sector === null ? COMPANIES : COMPANIES.filter((c) => c.sectors.includes(sector))),
    [sector],
  );

  const choose = useCallback((n: number | null) => {
    setSector(n);
    const url = new URL(window.location.href);
    if (n === null) url.searchParams.delete("sector");
    else url.searchParams.set("sector", String(n));
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <>
      <div className="shell">
        <Reveal index={2} className="mt-14">
          <div
            role="group"
            aria-label="Filter by sector"
            className="flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            <FilterButton active={sector === null} onClick={() => choose(null)}>
              All
            </FilterButton>
            {ACTIVE_SECTORS.map((s) => (
              <FilterButton
                key={s.n}
                active={sector === s.n}
                onClick={() => choose(s.n)}
              >
                {shortLabel(s.name)}
              </FilterButton>
            ))}
          </div>
        </Reveal>

        <p aria-live="polite" className="t-meta mt-8 text-ink-45">
          {visible.length} {visible.length === 1 ? "company" : "companies"}
          {sector === null ? "" : " in this sector"}
        </p>
      </div>

      <div className="mt-12 border-y border-ink-12">
        <div className="mx-auto grid max-w-[var(--container-shell)] gap-px bg-ink-12 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <div key={c.slug} className="bg-bone">
              <CompanyCard
                company={c}
                index={COMPANIES.indexOf(c)}
                headingLevel={2}
              />
            </div>
          ))}
          {/* Keeps the last row's hairlines complete on a partial row. */}
          {Array.from({ length: (3 - (visible.length % 3)) % 3 }).map((_, i) => (
            <div key={`filler-${i}`} className="hidden bg-bone lg:block" />
          ))}
        </div>
      </div>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-cursor="link"
      className={cn(
        "t-meta relative py-1 transition-opacity duration-[var(--dur-micro)]",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left",
        "after:bg-current after:transition-transform after:duration-[var(--dur-micro)]",
        "after:ease-[var(--ease-out)]",
        active
          ? "after:scale-x-100"
          : "opacity-45 after:scale-x-0 hover:opacity-100 hover:after:scale-x-100",
      )}
    >
      {children}
    </button>
  );
}
