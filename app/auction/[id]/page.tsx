/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import BidBox from "@/components/BidBox";
import Countdown from "@/components/Countdown";
import Icon from "@/components/Icon";
import LiveRefresh from "@/components/LiveRefresh";
import { PreviewBanner } from "@/components/SetupNotice";
import WatchButton from "@/components/WatchButton";
import { getAuction, getBids, getCategories } from "@/lib/data";
import { CONDITION_LABEL, egp, minNextBid } from "@/lib/format";
import { currentUser, hasSupabase, supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAuction(id);
  if (!a) notFound();

  const [bids, cats, user] = await Promise.all([getBids(id), getCategories(), currentUser()]);
  const cat = cats.find((c) => c.id === a.category_id);

  let hasDeposit = false;
  let watching = false;
  if (user) {
    const sb = await supabaseServer();
    const [d, w] = await Promise.all([
      sb.from("deposits").select("status").eq("auction_id", id).eq("user_id", user.id).eq("status", "held").maybeSingle(),
      sb.from("watchlist").select("auction_id").eq("auction_id", id).eq("user_id", user.id).maybeSingle(),
    ]);
    hasDeposit = Boolean(d.data);
    watching = Boolean(w.data);
  }

  const closed = a.status !== "live" || (a.ends_at !== null && new Date(a.ends_at) <= new Date());
  const youWon = user && a.winner_id === user.id;
  const topBidder = bids[0]?.bidder_id;

  return (
    <div className="space-y-5">
      <PreviewBanner />
      <LiveRefresh auctionId={id} />
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/buy" className="hover:text-fg">Auctions</Link>
        {cat && <> / <Link href={`/buy?category=${cat.slug}`} className="hover:text-fg">{cat.name_en}</Link></>}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="card overflow-hidden">
            {a.images[0] ? (
              <img src={a.images[0]} alt={a.title} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-teal-soft text-teal/60"><Icon name={cat?.icon ?? "tag"} size={72} /></div>
            )}
          </div>
          {a.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {a.images.slice(1).map((src) => <img key={src} src={src} alt="" className="h-20 w-20 shrink-0 rounded-md object-cover" />)}
            </div>
          )}
          <div className="card space-y-3 p-5">
            <h2 className="text-lg font-bold">About this item</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed">{a.description || "No description provided."}</p>
            <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
              <div><dt className="text-muted">Condition</dt><dd className="font-medium">{CONDITION_LABEL[a.condition]}</dd></div>
              <div><dt className="text-muted">Location</dt><dd className="font-medium">{a.city ?? "Egypt"}</dd></div>
              <div><dt className="text-muted">Starting price</dt><dd className="tnum font-medium">{a.open_to_highest ? "Open to highest bidder" : egp(a.start_price)}</dd></div>
              <div><dt className="text-muted">Reserve</dt><dd className="font-medium">{a.has_reserve ? "Yes (hidden)" : "None"}</dd></div>
            </dl>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold leading-snug md:text-2xl">{a.title}</h1>
              <WatchButton auctionId={id} watching={watching} signedIn={Boolean(user)} />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted">{a.bid_count === 0 ? "Starting at" : closed ? "Final price" : "Current bid"}</div>
                <div className="tnum font-display text-4xl font-bold text-teal">{egp(a.current_price)}</div>
                <div className="tnum text-sm text-muted">{a.bid_count} {a.bid_count === 1 ? "bid" : "bids"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-muted">{closed ? "Status" : "Time left"}</div>
                {closed ? <span className="font-semibold">{a.status === "cancelled" ? "Cancelled" : "Ended"}</span> : <Countdown endsAt={a.ends_at} big />}
              </div>
            </div>
            {user && !closed && topBidder === user.id && (
              <p className="rounded-md bg-teal-soft px-3 py-2 text-sm font-medium text-teal">You're the highest bidder.</p>
            )}
            {youWon && <p className="rounded-md bg-brass-soft px-3 py-2 text-sm font-medium">You won this auction. Your deposit has been applied to the price.</p>}
          </div>

          <BidBox auctionId={id} minBid={minNextBid(a)} depositAmount={a.deposit_amount} hasDeposit={hasDeposit}
            signedIn={Boolean(user)} isSeller={user?.id === a.seller_id} closed={closed} demo={!hasSupabase} />

          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold">Bid history</h2>
            {bids.length === 0 ? (
              <p className="text-sm text-muted">No bids yet. Be the first.</p>
            ) : (
              <ol className="divide-y divide-line text-sm">
                {bids.map((b, i) => (
                  <li key={b.id} className="flex items-center justify-between py-2">
                    <span className={i === 0 ? "font-semibold" : "text-muted"}>{b.bidder_name ?? "Bidder"}{i === 0 && !closed ? " · leading" : ""}</span>
                    <span className="tnum font-medium">{egp(b.amount)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
