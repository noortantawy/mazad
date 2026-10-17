"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWatch } from "@/app/actions";
import Icon from "./Icon";

export default function WatchButton({ auctionId, watching, signedIn }: { auctionId: string; watching: boolean; signedIn: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(watching);
  const [pending, start] = useTransition();

  function click() {
    if (!signedIn) return router.push(`/login?next=/auction/${auctionId}`);
    start(async () => {
      const r = await toggleWatch(auctionId, on);
      if (!r.error) setOn(!on);
    });
  }

  return (
    <button type="button" onClick={click} disabled={pending} aria-pressed={on}
      className={`btn btn-ghost ${on ? "!border-brass !text-brass" : ""}`}>
      <Icon name="heart" size={18} className={on ? "fill-current" : ""} />
      {on ? "Watching" : "Watch"}
    </button>
  );
}
