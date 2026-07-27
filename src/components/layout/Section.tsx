import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Rule } from "@/components/ui/Rule";
import { cn } from "@/lib/cn";

/**
 * Section rhythm. Every section opens with the Zarnex Rule and an eyebrow.
 * `ground="void"` inverts to the cinematic palette — used sparingly, as
 * structure, never as decoration.
 */
export function Section({
  eyebrow,
  ground = "bone",
  size = "default",
  className,
  contentClassName,
  children,
  id,
}: {
  eyebrow?: string;
  ground?: "bone" | "void";
  size?: "default" | "sm";
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  id?: string;
}) {
  const void_ = ground === "void";

  return (
    <section
      id={id}
      data-ground={ground}
      className={cn(
        void_ ? "ground-void" : "ground-bone",
        size === "sm"
          ? "py-[var(--spacing-section-sm)]"
          : "py-[var(--spacing-section)]",
        className,
      )}
    >
      <div className={cn("shell", contentClassName)}>
        {eyebrow ? (
          <div className="mb-14">
            <Rule className={void_ ? "text-bone" : "text-ink"} />
            <Reveal index={1}>
              <p className={cn("t-eyebrow mt-6", void_ ? "text-paper-45" : "text-ink-45")}>
                {eyebrow}
              </p>
            </Reveal>
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
