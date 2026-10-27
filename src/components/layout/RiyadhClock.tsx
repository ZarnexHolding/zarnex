"use client";

import { useEffect, useState } from "react";

/**
 * Live local time in Riyadh. Renders nothing until mounted so the server
 * and client markup can never disagree.
 */
export function RiyadhClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="t-meta text-paper-55 tabular-nums">
      Riyadh {time ?? "--:--"}
    </p>
  );
}
