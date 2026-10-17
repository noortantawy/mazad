import { DEMO_AUCTIONS, DEMO_CATEGORIES, demoBids } from "./demo";
import { hasSupabase, supabaseServer } from "./supabase/server";
import type { Auction, Bid, Category, Filters } from "./types";

const COLS =
  "id, seller_id, category_id, title, description, images, condition, city, start_price, open_to_highest, has_reserve, mode, ends_at, status, current_price, bid_count, winner_id, deposit_amount, created_at";

const num = (a: Auction): Auction => ({
  ...a,
  start_price: Number(a.start_price),
  current_price: Number(a.current_price),
  deposit_amount: Number(a.deposit_amount),
});

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return DEMO_CATEGORIES;
  const sb = await supabaseServer();
  const { data } = await sb.from("categories").select("*").order("id");
  return (data as Category[]) ?? [];
}

export async function listAuctions(f: Filters = {}, limit = 48): Promise<Auction[]> {
  const cats = await getCategories();
  const catId = f.category ? cats.find((c) => c.slug === f.category)?.id : undefined;
  const soon = f.endsWithin ? new Date(Date.now() + f.endsWithin * 3600_000).toISOString() : null;

  if (!hasSupabase) {
    let rows = DEMO_AUCTIONS.filter((a) => a.status === "live");
    if (f.q) rows = rows.filter((a) => a.title.toLowerCase().includes(f.q!.toLowerCase()));
    if (catId) rows = rows.filter((a) => a.category_id === catId);
    if (f.minPrice != null) rows = rows.filter((a) => a.current_price >= f.minPrice!);
    if (f.maxPrice != null) rows = rows.filter((a) => a.current_price <= f.maxPrice!);
    if (f.maxStart != null) rows = rows.filter((a) => a.start_price <= f.maxStart!);
    if (f.openOnly) rows = rows.filter((a) => a.open_to_highest);
    if (soon) rows = rows.filter((a) => a.ends_at && a.ends_at <= soon);
    if (f.city) rows = rows.filter((a) => a.city === f.city);
    if (f.condition) rows = rows.filter((a) => a.condition === f.condition);
    const by: Record<string, (a: Auction, b: Auction) => number> = {
      ending: (a, b) => (a.ends_at ?? "9").localeCompare(b.ends_at ?? "9"),
      newest: (a, b) => b.created_at.localeCompare(a.created_at),
      price_asc: (a, b) => a.current_price - b.current_price,
      price_desc: (a, b) => b.current_price - a.current_price,
      popular: (a, b) => (b.trend_score ?? 0) - (a.trend_score ?? 0),
    };
    return rows.sort(by[f.sort ?? "ending"]).slice(0, limit);
  }

  const sb = await supabaseServer();
  let q = sb
    .from("auctions_trending")
    .select(`${COLS}, trend_score`)
    .eq("status", "live")
    .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`);
  if (f.q) q = q.ilike("title", `%${f.q.replace(/[%,]/g, " ")}%`);
  if (catId) q = q.eq("category_id", catId);
  if (f.minPrice != null) q = q.gte("current_price", f.minPrice);
  if (f.maxPrice != null) q = q.lte("current_price", f.maxPrice);
  if (f.maxStart != null) q = q.lte("start_price", f.maxStart);
  if (f.openOnly) q = q.eq("open_to_highest", true);
  if (soon) q = q.not("ends_at", "is", null).lte("ends_at", soon);
  if (f.city) q = q.eq("city", f.city);
  if (f.condition) q = q.eq("condition", f.condition);
  switch (f.sort ?? "ending") {
    case "newest": q = q.order("created_at", { ascending: false }); break;
    case "price_asc": q = q.order("current_price", { ascending: true }); break;
    case "price_desc": q = q.order("current_price", { ascending: false }); break;
    case "popular": q = q.order("trend_score", { ascending: false }); break;
    default: q = q.order("ends_at", { ascending: true, nullsFirst: false });
  }
  const { data } = await q.limit(limit);
  return ((data as unknown as Auction[]) ?? []).map(num);
}

export const getTrending = (limit = 8) => listAuctions({ sort: "popular" }, limit);
export const getEndingSoon = (limit = 8) => listAuctions({ endsWithin: 24, sort: "ending" }, limit);
export const getNewest = (limit = 8) => listAuctions({ sort: "newest" }, limit);

export async function getAuction(id: string): Promise<Auction | null> {
  if (!hasSupabase) return DEMO_AUCTIONS.find((a) => a.id === id) ?? null;
  const sb = await supabaseServer();
  const { data } = await sb.from("auctions").select(COLS).eq("id", id).maybeSingle();
  return data ? num(data as unknown as Auction) : null;
}

export async function getBids(auctionId: string, limit = 20): Promise<Bid[]> {
  if (!hasSupabase) return demoBids(auctionId);
  const sb = await supabaseServer();
  const { data } = await sb
    .from("bids")
    .select("id, auction_id, bidder_id, amount, created_at")
    .eq("auction_id", auctionId)
    .order("amount", { ascending: false })
    .limit(limit);
  const bids = (data ?? []) as Bid[];
  const ids = [...new Set(bids.map((b) => b.bidder_id))];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: ps } = await sb.from("public_profiles").select("id, name").in("id", ids);
    (ps ?? []).forEach((p: { id: string; name: string }) => names.set(p.id, p.name));
  }
  return bids.map((b) => ({ ...b, amount: Number(b.amount), bidder_name: names.get(b.bidder_id) ?? "Bidder" }));
}

export async function getCities(): Promise<string[]> {
  return ["Cairo", "Giza", "Alexandria", "Mansoura", "Tanta", "Assiut", "Luxor", "Aswan", "Port Said", "Suez"];
}
