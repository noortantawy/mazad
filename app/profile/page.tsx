import Link from "next/link";
import { redirect } from "next/navigation";
import { cancelAuction, closeAuction, signOut } from "@/app/actions";
import AuctionCard from "@/components/AuctionCard";
import { NeedsBackend } from "@/components/SetupNotice";
import TopUpForm from "@/components/TopUpForm";
import { getCategories } from "@/lib/data";
import { egp } from "@/lib/format";
import { currentUser, hasSupabase, supabaseServer } from "@/lib/supabase/server";
import type { Auction } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS = [
  ["bids", "My bids"],
  ["listings", "My listings"],
  ["watchlist", "Watchlist"],
  ["wallet", "Wallet"],
] as const;

const COLS =
  "id, seller_id, category_id, title, description, images, condition, city, start_price, open_to_highest, has_reserve, mode, ends_at, status, current_price, bid_count, winner_id, deposit_amount, created_at";

const num = (a: Auction): Auction => ({
  ...a,
  start_price: Number(a.start_price),
  current_price: Number(a.current_price),
  deposit_amount: Number(a.deposit_amount),
});

const TX_LABEL: Record<string, string> = {
  topup: "Top-up", hold: "Deposit held", release: "Deposit refunded", apply: "Deposit applied to purchase", forfeit: "Deposit forfeited",
};

function Badge({ children, tone }: { children: React.ReactNode; tone: "good" | "bad" | "muted" | "brass" }) {
  const cls = { good: "bg-teal-soft text-teal", bad: "bg-brass-soft text-bad", muted: "bg-bg text-muted border border-line", brass: "bg-brass-soft text-brass" }[tone];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

export default async function Profile({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!hasSupabase) return <NeedsBackend />;
  const user = await currentUser();
  if (!user) redirect("/login?next=/profile");
  const { tab = "bids" } = await searchParams;
  const sb = await supabaseServer();
  const cats = await getCategories();

  const { data: profile } = await sb.from("profiles").select("name, wallet_balance, wallet_held, strikes").eq("id", user.id).single();
  const balance = Number(profile?.wallet_balance ?? 0);
  const held = Number(profile?.wallet_held ?? 0);

  let body: React.ReactNode = null;

  if (tab === "bids") {
    const { data } = await sb
      .from("bids")
      .select(`auction_id, amount, auctions(${COLS})`)
      .eq("bidder_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    const mine = new Map<string, { a: Auction; max: number }>();
    for (const row of (data ?? []) as unknown as { auction_id: string; amount: number; auctions: Auction }[]) {
      if (!row.auctions) continue;
      const cur = mine.get(row.auction_id);
      const amt = Number(row.amount);
      if (!cur || amt > cur.max) mine.set(row.auction_id, { a: num(row.auctions), max: amt });
    }
    const rows = [...mine.values()];
    body = rows.length ? (
      <ul className="space-y-3">
        {rows.map(({ a, max }) => {
          const live = a.status === "live" && (!a.ends_at || new Date(a.ends_at) > new Date());
          const status = live
            ? max >= a.current_price ? <Badge tone="good">Winning</Badge> : <Badge tone="bad">Outbid</Badge>
            : a.winner_id === user.id ? <Badge tone="brass">Won</Badge> : <Badge tone="muted">{a.status === "cancelled" ? "Cancelled" : "Lost"}</Badge>;
          return (
            <li key={a.id} className="card flex items-center justify-between gap-3 p-4">
              <Link href={`/auction/${a.id}`} className="min-w-0">
                <span className="block truncate font-semibold">{a.title}</span>
                <span className="tnum text-sm text-muted">Your top bid {egp(max)} · now {egp(a.current_price)}</span>
              </Link>
              {status}
            </li>
          );
        })}
      </ul>
    ) : <Empty text="You haven't bid on anything yet." href="/buy" cta="Browse auctions" />;
  }

  if (tab === "listings") {
    const { data } = await sb.from("auctions").select(COLS).eq("seller_id", user.id).order("created_at", { ascending: false });
    const rows = ((data ?? []) as unknown as Auction[]).map(num);
    body = rows.length ? (
      <ul className="space-y-3">
        {rows.map((a) => (
          <li key={a.id} className="card space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/auction/${a.id}`} className="min-w-0">
                <span className="block truncate font-semibold">{a.title}</span>
                <span className="tnum text-sm text-muted">{egp(a.current_price)} · {a.bid_count} bids</span>
              </Link>
              <Badge tone={a.status === "live" ? "good" : "muted"}>{a.status === "live" ? "Live" : a.status === "ended" ? (a.winner_id ? "Sold" : "Not sold") : "Cancelled"}</Badge>
            </div>
            {a.status === "live" && (
              <div className="flex flex-wrap gap-2">
                {a.mode === "open_ended" && a.bid_count > 0 && (
                  <form action={closeAuction.bind(null, a.id)}><button className="btn btn-primary !py-1.5 text-sm">Accept top bid and close</button></form>
                )}
                <form action={cancelAuction.bind(null, a.id)}><button className="btn btn-ghost !py-1.5 text-sm">Cancel listing</button></form>
              </div>
            )}
          </li>
        ))}
      </ul>
    ) : <Empty text="You haven't listed anything yet." href="/sell" cta="Sell something" />;
  }

  if (tab === "watchlist") {
    const { data } = await sb.from("watchlist").select(`auctions(${COLS})`).eq("user_id", user.id).order("created_at", { ascending: false });
    const rows = ((data ?? []) as unknown as { auctions: Auction | null }[]).flatMap((r) => (r.auctions ? [num(r.auctions)] : []));
    body = rows.length ? (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {rows.map((a) => <AuctionCard key={a.id} a={a} category={cats.find((c) => c.id === a.category_id)} />)}
      </div>
    ) : <Empty text="Tap Watch on any auction to keep an eye on it." href="/buy" cta="Browse auctions" />;
  }

  if (tab === "wallet") {
    const { data } = await sb.from("wallet_tx").select("id, type, amount, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
    body = (
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card space-y-4 p-5">
          <h2 className="text-lg font-bold">Add funds</h2>
          <TopUpForm />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-bold">History</h2>
          {data?.length ? (
            <ul className="divide-y divide-line text-sm">
              {data.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <span>{TX_LABEL[t.type] ?? t.type}<span className="block text-xs text-muted">{new Date(t.created_at).toLocaleString("en-GB")}</span></span>
                  <span className={`tnum font-medium ${t.type === "topup" || t.type === "release" ? "text-good" : ""}`}>{t.type === "topup" || t.type === "release" ? "+" : "−"}{egp(Number(t.amount))}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">No transactions yet.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{profile?.name || user.email}</h1>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <form action={signOut}><button className="btn btn-ghost">Sign out</button></form>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4"><div className="text-xs uppercase tracking-wide text-muted">Available</div><div className="tnum font-display text-2xl font-bold text-teal">{egp(balance)}</div></div>
        <div className="card p-4"><div className="text-xs uppercase tracking-wide text-muted">Held as deposits</div><div className="tnum font-display text-2xl font-bold">{egp(held)}</div></div>
      </div>
      {(profile?.strikes ?? 0) > 0 && <p className="text-sm text-bad">Missed payments on your account: {profile?.strikes}. Three restrict bidding.</p>}

      <nav className="flex gap-1 overflow-x-auto border-b border-line" aria-label="Profile sections">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/profile?tab=${k}`} aria-current={tab === k ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? "border-teal text-teal" : "border-transparent text-muted"}`}>
            {label}
          </Link>
        ))}
      </nav>
      {body}
    </div>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-sm text-muted">{text}</p>
      <Link href={href} className="btn btn-primary mt-4">{cta}</Link>
    </div>
  );
}
