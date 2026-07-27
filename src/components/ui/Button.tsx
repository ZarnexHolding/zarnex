import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight, ArrowDiagonal } from "@/components/ui/Icon";

type Variant = "primary" | "ghost" | "text";

/** Ground-aware styling lives in globals.css @layer components. */
const variants: Record<Variant, string> = {
  primary: "btn-sized btn-primary",
  ghost: "btn-sized btn-ghost",
  text: "btn-text",
};

type Props = {
  variant?: Variant;
  href?: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({
  variant = "primary",
  href,
  external,
  children,
  className,
  ...rest
}: Props) {
  const Arrow = external ? ArrowDiagonal : ArrowRight;
  const cls = cn(
    "btn group/btn t-meta focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold",
    variants[variant],
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {/* SHIFT — 4px travel, the only hover movement in the system */}
      <Arrow className="size-3.5 shrink-0 transition-transform duration-[var(--dur-micro)] ease-[var(--ease-out)] group-hover/btn:translate-x-1" />
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          data-cursor="link"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} data-cursor="link">
        {content}
      </Link>
    );
  }

  return (
    <button className={cls} data-cursor="link" {...rest}>
      {content}
    </button>
  );
}
