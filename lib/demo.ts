import type { Auction, Bid, Category } from "./types";

// Read-only sample data shown when Supabase env vars are not set, so the UI can be explored first.

export const DEMO_CATEGORIES: Category[] = [
  { id: 1, slug: "phones", name_en: "Phones & Tablets", name_ar: "موبايلات وتابلت", icon: "smartphone" },
  { id: 2, slug: "electronics", name_en: "Electronics", name_ar: "إلكترونيات", icon: "cpu" },
  { id: 3, slug: "fashion", name_en: "Fashion & Sneakers", name_ar: "موضة وأحذية", icon: "shirt" },
  { id: 4, slug: "home", name_en: "Home & Furniture", name_ar: "أثاث ومنزل", icon: "sofa" },
  { id: 5, slug: "cars", name_en: "Cars & Bikes", name_ar: "سيارات ودراجات", icon: "car" },
  { id: 6, slug: "collectibles", name_en: "Collectibles", name_ar: "مقتنيات وتحف", icon: "gem" },
  { id: 7, slug: "watches", name_en: "Watches & Jewelry", name_ar: "ساعات ومجوهرات", icon: "watch" },
  { id: 8, slug: "gaming", name_en: "Gaming", name_ar: "ألعاب فيديو", icon: "gamepad" },
  { id: 9, slug: "sports", name_en: "Sports & Outdoor", name_ar: "رياضة", icon: "dumbbell" },
  { id: 10, slug: "other", name_en: "Other", name_ar: "أخرى", icon: "tag" },
];

const H = 3600_000;
const now = Date.now();
const iso = (ms: number) => new Date(now + ms).toISOString();

type Seed = [title: string, cat: number, start: number, current: number, bids: number, endsInH: number | null, city: string, cond: Auction["condition"], open?: boolean, reserve?: boolean];

const SEEDS: Seed[] = [
  ["iPhone 13 128GB, battery 91%", 1, 14000, 16250, 23, 0.8, "Cairo", "used", false, true],
  ["Nike Dunk Low Panda, size 43, deadstock", 3, 3500, 4600, 31, 2.5, "Giza", "new", false, false],
  ["PlayStation 5 + 2 controllers", 8, 18000, 21400, 18, 5, "Alexandria", "like_new", false, true],
  ["Vintage Omega Seamaster 1968", 7, 25000, 41500, 44, 9, "Cairo", "used", false, true],
  ["Leather sofa, 3 seater, barely used", 4, 1, 3200, 12, 26, "Cairo", "like_new", true, false],
  ["Samsung 55\" QLED TV", 2, 9000, 9000, 0, 30, "Mansoura", "like_new", false, false],
  ["Egyptian 1 pound silver coin, 1938", 6, 800, 2350, 19, 48, "Cairo", "used", false, false],
  ["Mountain bike, 27.5\", Shimano gears", 9, 4000, 4750, 7, 70, "Giza", "used", false, false],
  ["Set of 6 hand-painted Khan el-Khalili plates", 6, 1, 640, 15, 3.2, "Cairo", "new", true, false],
  ["MacBook Air M1, 8/256", 2, 24000, 27800, 29, 12, "Cairo", "used", false, true],
  ["Toyota Corolla 2015, one owner", 5, 380000, 405000, 9, null as unknown as number, "Alexandria", "used", false, true],
  ["Adidas Samba OG, size 42", 3, 2200, 2200, 0, 20, "Tanta", "new", false, false],
];

export const DEMO_AUCTIONS: Auction[] = SEEDS.map(
  ([title, cat, start, current, bids, endsIn, city, cond, open, reserve], i) => ({
    id: `demo-${i + 1}`,
    seller_id: "demo-seller",
    category_id: cat,
    title,
    description:
      "Sample listing shown in preview mode. Connect Supabase to see real auctions and place bids.",
    images: [],
    condition: cond,
    city,
    start_price: start,
    open_to_highest: Boolean(open),
    has_reserve: Boolean(reserve),
    mode: endsIn ? "timed" : "open_ended",
    ends_at: endsIn ? iso(endsIn * H) : null,
    status: "live",
    current_price: current,
    bid_count: bids,
    winner_id: null,
    deposit_amount: Math.round(start * 0.01 * 100) / 100,
    created_at: iso(-(i + 1) * 2 * H),
    trend_score: bids * 3 + (i % 4) * 2,
  }),
);

export function demoBids(auctionId: string): Bid[] {
  const a = DEMO_AUCTIONS.find((x) => x.id === auctionId);
  if (!a || a.bid_count === 0) return [];
  const names = ["Omar", "Mona", "Karim", "Salma", "Youssef"];
  return Array.from({ length: Math.min(a.bid_count, 6) }, (_, i) => ({
    id: i,
    auction_id: auctionId,
    bidder_id: `demo-bidder-${i}`,
    amount: Math.max(a.start_price, a.current_price - i * 100),
    created_at: iso(-(i + 1) * 17 * 60_000),
    bidder_name: names[i % names.length],
  }));
}
