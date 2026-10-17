import type { Auction } from "./types";

export const egp = (n: number) => `EGP ${Math.round(n).toLocaleString("en-US")}`;

/** Mirrors public.min_increment in the SQL schema. */
export function minIncrement(price: number) {
  return price < 500 ? 5 : price < 5000 ? 25 : 100;
}

/** Lowest amount the next bid may be. Mirrors place_bid. */
export function minNextBid(a: Pick<Auction, "bid_count" | "start_price" | "current_price">) {
  return a.bid_count === 0 ? a.start_price : a.current_price + minIncrement(a.current_price);
}

export function timeLeft(endsAt: string | null, now = Date.now()) {
  if (!endsAt) return { label: "Open-ended", urgent: false, over: false };
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return { label: "Ended", urgent: false, over: true };
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const label =
    d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}:${String(sec).padStart(2, "0")}`;
  return { label, urgent: ms < 60 * 60 * 1000, over: false };
}

export const CONDITION_LABEL: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  used: "Used",
};

const FRIENDLY: Record<string, string> = {
  not_authenticated: "Please sign in first.",
  auction_closed: "This auction has already closed.",
  seller_cannot_bid: "You can't bid on your own listing.",
  account_restricted: "Your account is restricted after repeated missed payments.",
  auction_not_found: "That auction no longer exists.",
  invalid_amount: "Enter an amount between 1 and 100,000.",
  invalid_start_price: "Starting price must be at least EGP 1.",
  reserve_below_start: "The reserve can't be lower than the starting price.",
  invalid_duration: "Duration must be between 1 hour and 14 days.",
  forbidden: "You don't have permission to do that.",
};

export function friendlyError(message: string) {
  const key = message.split(":")[0].trim();
  const arg = message.split(":")[1]?.trim();
  if (key === "bid_too_low") return `Your bid must be at least ${egp(Number(arg))}.`;
  if (key === "insufficient_wallet")
    return `You need ${egp(Number(arg))} in your wallet for the 1% deposit. Top up on the Profile tab.`;
  return FRIENDLY[key] ?? message;
}
