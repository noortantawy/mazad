import Link from "next/link";
import AuctionCard from "@/components/AuctionCard";
import { PreviewBanner } from "@/components/SetupNotice";
import { getCategories, getCities, listAuctions } from "@/lib/data";
import type { Filters } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = Record<string, string | undefined>;
const numOrUndef = (v?: string) => (v && Number.isFinite(Number(v)) ? Number(v) : undefined);

export default async function Buy({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters: Filters = {
    q: sp.q?.trim() || undefined,
    category: sp.category || undefined,
    minPrice: numOrUndef(sp.min),
    maxPrice: numOrUndef(sp.max),
    maxStart: numOrUndef(sp.start),
    openOnly: sp.open === "1",
    endsWithin: numOrUndef(sp.within),
    city: sp.city || undefined,
    condition: sp.condition || undefined,
    sort: (sp.sort as Filters["sort"]) || "ending",
  };
  const [cats, cities, items] = await Promise.all([getCategories(), getCities(), listAuctions(filters)]);
  const active = Object.entries(sp).filter(([k, v]) => v && k !== "sort").length;

  return (
    <div className="space-y-5">
      <PreviewBanner />
      <h1 className="text-2xl font-bold md:text-3xl">Find an auction</h1>

      <form method="get" className="card space-y-4 p-4">
        <div className="flex gap-2">
          <label htmlFor="q" className="sr-only">Search</label>
          <input id="q" name="q" defaultValue={sp.q} placeholder="Search phones, sneakers, sofas…" className="input" />
          <button className="btn btn-primary">Search</button>
        </div>

        <details open={active > (sp.q ? 1 : 0)} className="group">
          <summary className="cursor-pointer text-sm font-semibold text-teal">Filters{active ? ` (${active})` : ""}</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><label htmlFor="category" className="label">Category</label>
              <select id="category" name="category" defaultValue={sp.category ?? ""} className="input">
                <option value="">All categories</option>
                {cats.map((c) => <option key={c.id} value={c.slug}>{c.name_en}</option>)}</select></div>
            <div><label htmlFor="within" className="label">Time left</label>
              <select id="within" name="within" defaultValue={sp.within ?? ""} className="input">
                <option value="">Any</option><option value="1">Under 1 hour</option><option value="6">Under 6 hours</option>
                <option value="24">Under 24 hours</option><option value="168">Under 7 days</option></select></div>
            <div><label htmlFor="min" className="label">Budget from (EGP)</label>
              <input id="min" name="min" inputMode="numeric" defaultValue={sp.min} className="input" /></div>
            <div><label htmlFor="max" className="label">Budget up to (EGP)</label>
              <input id="max" name="max" inputMode="numeric" defaultValue={sp.max} className="input" /></div>
            <div><label htmlFor="start" className="label">Starting price up to (EGP)</label>
              <input id="start" name="start" inputMode="numeric" defaultValue={sp.start} className="input" /></div>
            <div><label htmlFor="city" className="label">City</label>
              <select id="city" name="city" defaultValue={sp.city ?? ""} className="input">
                <option value="">Anywhere</option>{cities.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label htmlFor="condition" className="label">Condition</label>
              <select id="condition" name="condition" defaultValue={sp.condition ?? ""} className="input">
                <option value="">Any</option><option value="new">New</option><option value="like_new">Like new</option><option value="used">Used</option></select></div>
            <div><label htmlFor="sort" className="label">Sort by</label>
              <select id="sort" name="sort" defaultValue={sp.sort ?? "ending"} className="input">
                <option value="ending">Ending soonest</option><option value="popular">Most popular</option><option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></div>
            <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
              <input type="checkbox" name="open" value="1" defaultChecked={sp.open === "1"} /> Only "open to highest bidder" auctions
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="btn btn-primary">Apply filters</button>
            <Link href="/buy" className="btn btn-ghost">Clear</Link>
          </div>
        </details>
      </form>

      <p className="text-sm text-muted" aria-live="polite">{items.length} {items.length === 1 ? "auction" : "auctions"}</p>

      {items.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((a) => <AuctionCard key={a.id} a={a} category={cats.find((c) => c.id === a.category_id)} />)}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <h2 className="text-lg font-semibold">Nothing matches yet</h2>
          <p className="mt-1 text-sm text-muted">Try a wider budget or fewer filters, or list the item yourself.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/buy" className="btn btn-ghost">Clear filters</Link>
            <Link href="/sell" className="btn btn-primary">Sell something</Link>
          </div>
        </div>
      )}
    </div>
  );
}
