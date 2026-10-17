"use client";

import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/format";
import Icon from "./Icon";

export default function Countdown({ endsAt, big = false }: { endsAt: string | null; big?: boolean }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (!endsAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const t = now == null ? { label: " ", urgent: false, over: false } : timeLeft(endsAt, now);
  const color = t.over ? "text-muted" : t.urgent ? "text-bad" : "text-fg";
  return (
    <span className={`tnum inline-flex items-center gap-1 font-medium ${color} ${big ? "text-xl" : "text-sm"}`}>
      <Icon name="clock" size={big ? 20 : 15} />
      {t.label}
    </span>
  );
}
