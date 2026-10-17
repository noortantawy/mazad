export type Category = {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  icon: string;
};

export type Auction = {
  id: string;
  seller_id: string;
  category_id: number;
  title: string;
  description: string;
  images: string[];
  condition: "new" | "like_new" | "used";
  city: string | null;
  start_price: number;
  open_to_highest: boolean;
  has_reserve: boolean;
  mode: "timed" | "open_ended";
  ends_at: string | null;
  status: "live" | "ended" | "cancelled";
  current_price: number;
  bid_count: number;
  winner_id: string | null;
  deposit_amount: number;
  created_at: string;
  trend_score?: number;
};

export type Bid = {
  id: number;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  bidder_name?: string;
};

export type Filters = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxStart?: number;
  openOnly?: boolean;
  endsWithin?: number; // hours
  city?: string;
  condition?: string;
  sort?: "ending" | "newest" | "price_asc" | "price_desc" | "popular";
};
