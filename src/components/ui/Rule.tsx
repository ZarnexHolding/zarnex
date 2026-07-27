import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/**
 * The Zarnex Rule — a 2px bar paired with a 1px hairline 6px below.
 * Taken from the page-header device in the profile document. Opens every
 * section. It is the element that makes a screenshot recognisable as Zarnex
 * with no logo in frame.
 */
export function Rule({
  className,
  width = "full",
  animate = true,
  index = 0,
}: {
  className?: string;
  width?: "full" | "short";
  animate?: boolean;
  index?: number;
}) {
  const cls = cn("rule", width === "short" && "max-w-24", className);

  if (!animate) return <span aria-hidden className={cls} />;

  return <Reveal as="span" kind="draw" index={index} aria-hidden className={cls} />;
}
