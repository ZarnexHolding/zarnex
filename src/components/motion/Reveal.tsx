"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { REVEAL_ROOT_MARGIN, STAGGER_MS } from "@/lib/motion";
import { cn } from "@/lib/cn";

type RevealKind = "rise" | "mask" | "draw";

type RevealProps = {
  as?: ElementType;
  kind?: RevealKind;
  /** Stagger index — multiplied by STAGGER_MS. */
  index?: number;
  /** Extra delay in ms, added on top of the stagger. */
  delay?: number;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>;

/**
 * T3 ambient reveal. The animation itself lives in CSS (globals.css);
 * this only adds `.is-in` once, on first intersection.
 *
 * IntersectionObserver + CSS transitions — no animation library on the
 * critical path, and reduced-motion is handled entirely in CSS.
 */
export function Reveal({
  as: Tag = "div",
  kind = "rise",
  index = 0,
  delay = 0,
  className,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect(); // fire once, never re-trigger
      },
      { rootMargin: REVEAL_ROOT_MARGIN, threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={kind}
      className={cn(className)}
      style={{ "--reveal-delay": `${index * STAGGER_MS + delay}ms` } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
