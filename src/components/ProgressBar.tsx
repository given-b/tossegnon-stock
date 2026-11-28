"use client";

import { useEffect, useState } from "react";

export default function ProgressBar({
  value,
  goal,
  thin = false,
}: {
  value: number;
  goal: number;
  thin?: boolean;
}) {
  const [w, setW] = useState(0);
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;

  useEffect(() => {
    const t = setTimeout(() => setW(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className={`w-full overflow-hidden rounded-full bg-teal-900/10 ${thin ? "h-2" : "h-3"}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-400"
        style={{ width: `${w}%`, transition: "width 1s cubic-bezier(0.2, 0.7, 0.2, 1)" }}
      />
    </div>
  );
}
