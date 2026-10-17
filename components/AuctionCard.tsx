/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CONDITION_LABEL, egp } from "@/lib/format";
import type { Auction, Category } from "@/lib/types";
import Countdown from "./Countdown";
import Icon from "./Icon";

export default function AuctionCard({ a, category }: { a: Auction; category?: Category }) {
  const unbid = a.bid_count === 0;
  return (
    <Link href={`/auction/${a.id}`} className="card group flex min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-teal-soft">
        {a.images[0] ? (
          <img src={a.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-teal/60">
            <Icon name={category?.icon ?? "tag"} size={44} />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {a.open_to_highest && <span className="rounded-full bg-brass px-2 py-0.5 text-[11px] font-semibold text-black">Open to highest</span>}
          {a.has_reserve && <span className="rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium">Reserve</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{a.title}</h3>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted">{unbid ? "Starting at" : "Current bid"}</div>
          <div className="tnum font-display text-xl font-bold text-teal">{egp(a.current_price)}</div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 text-sm text-muted">
          <Countdown endsAt={a.ends_at} />
          <span className="tnum">{a.bid_count} {a.bid_count === 1 ? "bid" : "bids"}</span>
        </div>
        <div className="text-xs text-muted">{CONDITION_LABEL[a.condition]}{a.city ? ` · ${a.city}` : ""}</div>
      </div>
    </Link>
  );
}
