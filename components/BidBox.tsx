"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { placeBid } from "@/app/actions";
import { egp, minIncrement } from "@/lib/format";

type Props = {
  auctionId: string;
  minBid: number;
  depositAmount: number;
  hasDeposit: boolean;
  signedIn: boolean;
  isSeller: boolean;
  closed: boolean;
  demo: boolean;
};

export default function BidBox({ auctionId, minBid, depositAmount, hasDeposit, signedIn, isSeller, closed, demo }: Props) {
  const [amount, setAmount] = useState(String(minBid));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (closed) return <div className="card p-4 text-sm text-muted">Bidding on this auction has closed.</div>;
  if (isSeller) return <div className="card p-4 text-sm text-muted">This is your listing. You can't bid on it.</div>;

  const step = minIncrement(minBid);
  const quick = [minBid, minBid + step, minBid + step * 4];

  function submit() {
    setMsg(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n < minBid) {
      setMsg({ ok: false, text: `Your bid must be at least ${egp(minBid)}.` });
      return;
    }
    start(async () => {
      const r = await placeBid(auctionId, n);
      if (r.error) setMsg({ ok: false, text: r.error });
      else {
        setMsg({ ok: true, text: `You're in at ${egp(n)}.` });
        setAmount(String(n + minIncrement(n)));
      }
    });
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap gap-2">
        {quick.map((q, i) => (
          <button key={q} type="button" onClick={() => setAmount(String(q))}
            className={`btn btn-ghost tnum flex-1 !px-2 !py-1.5 text-sm ${String(q) === amount ? "!border-teal !text-teal" : ""}`}>
            {i === 0 ? "Min " : "+"}{i === 0 ? egp(q) : egp(q - minBid)}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="bid" className="label">Your bid (EGP)</label>
        <input id="bid" inputMode="numeric" className="input tnum" value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
      </div>
      {!hasDeposit && (
        <p className="rounded-md bg-teal-soft px-3 py-2 text-xs text-teal">
          Your first bid holds a 1% deposit ({egp(depositAmount)}) from your wallet. You get it back if you don't win. If you win, it counts toward the price.
        </p>
      )}
      {demo ? (
        <button className="btn btn-primary w-full" disabled>Bidding is off in preview mode</button>
      ) : signedIn ? (
        <button className="btn btn-primary w-full" onClick={submit} disabled={pending}>
          {pending ? "Placing bid…" : "Place bid"}
        </button>
      ) : (
        <Link href={`/login?next=/auction/${auctionId}`} className="btn btn-primary w-full">Sign in to bid</Link>
      )}
      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-good" : "text-bad"}`}>
          {msg.text}{" "}
          {!msg.ok && msg.text.includes("Top up") && <Link href="/profile?tab=wallet" className="underline">Open wallet</Link>}
        </p>
      )}
    </div>
  );
}
