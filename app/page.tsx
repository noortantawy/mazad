import Link from "next/link";
import AuctionCard from "@/components/AuctionCard";
import Icon from "@/components/Icon";
import { PreviewBanner } from "@/components/SetupNotice";
import { getCategories, getEndingSoon, getNewest, getTrending } from "@/lib/data";
import type { Auction, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

function Row({ title, hint, href, items, cats }: { title: string; hint: string; href: string; items: Auction[]; cats: Category[] }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <p className="text-sm text-muted">{hint}</p>
        </div>
        <Link href={href} className="shrink-0 text-sm font-semibold text-teal">See all</Link>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {items.slice(0, 4).concat(items.slice(4, 8)).map((a) => (
          <div key={a.id} className="w-[220px] shrink-0 snap-start md:w-auto">
            <AuctionCard a={a} category={cats.find((c) => c.id === a.category_id)} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Explore() {
  const [cats, trending, ending, newest] = await Promise.all([getCategories(), getTrending(4), getEndingSoon(4), getNewest(4)]);

  return (
    <div className="space-y-10">
      <PreviewBanner />
      <section className="rounded-2xl bg-teal px-5 py-7 text-on-teal md:px-10 md:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Real bidders only</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight md:text-5xl">Bid on anything.<br />Pay only if you win.</h1>
        <p className="mt-3 max-w-xl text-sm opacity-90 md:text-base">
          Every bidder puts 1% down, so sellers never chase a no-show. Lose an auction and your deposit comes straight back.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/buy" className="btn bg-surface text-teal">Browse auctions</Link>
          <Link href="/sell" className="btn border border-current text-on-teal">Sell something</Link>
        </div>
      </section>

      <Row title="Trending now" hint="Most bids and watchers in the last 24 hours" href="/buy?sort=popular" items={trending} cats={cats} />
      <Row title="Ending soon" hint="Closing within 24 hours" href="/buy?within=24&sort=ending" items={ending} cats={cats} />

      <section className="space-y-3">
        <h2 className="text-xl font-bold md:text-2xl">Categories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {cats.map((c) => (
            <Link key={c.id} href={`/buy?category=${c.slug}`} className="card flex items-center gap-3 p-3 hover:border-teal">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal"><Icon name={c.icon} /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{c.name_en}</span>
                <span className="block truncate text-xs text-muted" lang="ar" dir="rtl">{c.name_ar}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Row title="Just listed" hint="Fresh auctions, early bids win" href="/buy?sort=newest" items={newest} cats={cats} />

      <section className="card grid gap-4 p-5 md:grid-cols-3">
        {[
          ["shield", "1% deposit, refunded if you lose", "Held when you place your first bid on an auction. Winners have it counted toward the price."],
          ["gavel", "Start at EGP 1 or set a floor", "Sellers can open to the highest bidder or hide a minimum price they won't go below."],
          ["clock", "No last-second snipes", "A bid in the final 2 minutes adds 2 more, so everyone gets a fair last word."],
        ].map(([icon, t, d]) => (
          <div key={t} className="flex gap-3">
            <Icon name={icon} className="mt-0.5 shrink-0 text-brass" />
            <div><h3 className="font-semibold">{t}</h3><p className="text-sm text-muted">{d}</p></div>
          </div>
        ))}
      </section>
    </div>
  );
}
