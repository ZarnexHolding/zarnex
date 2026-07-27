"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";
import { Menu, Close } from "@/components/ui/Icon";
import { COMPANIES } from "@/lib/companies";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/companies", label: "Companies" },
  { href: "/innovation", label: "Innovation" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/careers", label: "Careers" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  // Hide on scroll-down, return on scroll-up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 100);
      setHidden(y > 240 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation. Derived during render rather than in an
  // effect, so there is no extra commit with the menu still open.
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="t-meta sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-bone"
      >
        Skip to content
      </a>

      {/*
        The header mirrors the ground beneath it — see GroundTheme.
        Colours come from `currentColor` so a single attribute flips the lot.
      */}
      <header
        data-open={open || undefined}
        data-scrolled={(scrolled && !open) || undefined}
        data-hidden={(hidden && !open) || undefined}
        className="site-header fixed inset-x-0 top-0 z-50 h-[72px] border-b"
      >
        <div className="shell flex h-full items-center justify-between">
          <Wordmark />

          <nav aria-label="Primary" className="max-lg:hidden">
            <ul className="flex items-center gap-10">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-cursor="link"
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "t-meta relative inline-block py-2 transition-opacity duration-[var(--dur-micro)]",
                        "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left",
                        "after:bg-current after:transition-transform after:duration-[var(--dur-micro)] after:ease-[var(--ease-out)]",
                        active
                          ? "after:scale-x-100"
                          : "opacity-65 after:scale-x-0 hover:opacity-100 hover:after:scale-x-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" href="/contact" className="max-lg:hidden">
              Contact
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-overlay"
              aria-label={open ? "Close menu" : "Open menu"}
              data-cursor="link"
              className="-mr-2 grid size-11 place-items-center lg:hidden"
            >
              {open ? <Close className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* CROSS — overlay menu, mobile/tablet only */}
      <div
        id="menu-overlay"
        hidden={!open}
        className="fixed inset-0 z-40 overflow-y-auto bg-bone pt-[72px] text-ink lg:hidden"
      >
        <div className="shell py-12">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {[...NAV, { href: "/contact", label: "Contact" }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="t-display-2 block py-3 transition-opacity duration-[var(--dur-micro)] hover:opacity-60"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <span className="rule mt-14 text-ink-12" aria-hidden />

          <p className="t-eyebrow mt-10 text-ink-45">The ecosystem</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 max-[480px]:grid-cols-1">
            {COMPANIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/companies/${c.slug}`}
                  prefetch={false}
                  className="t-caption text-ink-70 transition-colors duration-[var(--dur-micro)] hover:text-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
