"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { friendlyError } from "@/lib/format";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export type Result = { error?: string; id?: string };

export async function signIn(_: Result, form: FormData): Promise<Result> {
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
  if (error) return { error: error.message };
  redirect(String(form.get("next") || "/profile"));
}

export async function signUp(_: Result, form: FormData): Promise<Result> {
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email: String(form.get("email")),
    password: String(form.get("password")),
    options: { data: { name: String(form.get("name") || "") } },
  });
  if (error) return { error: error.message };
  if (!data.session) return { error: "Check your email to confirm your account, then sign in." };
  redirect(String(form.get("next") || "/profile"));
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

export async function placeBid(auctionId: string, amount: number): Promise<Result> {
  if (!(await currentUser())) return { error: "Please sign in to bid." };
  const sb = await supabaseServer();
  const { error } = await sb.rpc("place_bid", { p_auction: auctionId, p_amount: amount });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath(`/auction/${auctionId}`);
  return {};
}

export async function toggleWatch(auctionId: string, watching: boolean): Promise<Result> {
  const user = await currentUser();
  if (!user) return { error: "Please sign in to save auctions." };
  const sb = await supabaseServer();
  const { error } = watching
    ? await sb.from("watchlist").delete().eq("user_id", user.id).eq("auction_id", auctionId)
    : await sb.from("watchlist").insert({ user_id: user.id, auction_id: auctionId });
  if (error) return { error: error.message };
  revalidatePath(`/auction/${auctionId}`);
  revalidatePath("/profile");
  return {};
}

export async function topUp(_: Result, form: FormData): Promise<Result> {
  const sb = await supabaseServer();
  const { error } = await sb.rpc("topup_wallet", { p_amount: Number(form.get("amount")) });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/profile");
  return {};
}

export type NewAuction = {
  title: string;
  description: string;
  category: number;
  images: string[];
  condition: string;
  city: string;
  startPrice: number;
  openToHighest: boolean;
  reserve: number | null;
  durationHours: number | null;
};

export async function createAuction(a: NewAuction): Promise<Result> {
  if (!(await currentUser())) return { error: "Please sign in to sell." };
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("create_auction", {
    p_title: a.title.trim(),
    p_description: a.description.trim(),
    p_category: a.category,
    p_images: a.images,
    p_condition: a.condition,
    p_city: a.city,
    p_start_price: a.startPrice,
    p_open_to_highest: a.openToHighest,
    p_reserve: a.reserve,
    p_duration_hours: a.durationHours,
  });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/");
  revalidatePath("/buy");
  return { id: data as string };
}

export async function closeAuction(auctionId: string) {
  const sb = await supabaseServer();
  await sb.rpc("seller_close_auction", { p_auction: auctionId });
  revalidatePath("/profile");
  revalidatePath(`/auction/${auctionId}`);
}

export async function cancelAuction(auctionId: string) {
  const sb = await supabaseServer();
  await sb.rpc("cancel_auction", { p_auction: auctionId });
  revalidatePath("/profile");
  revalidatePath(`/auction/${auctionId}`);
}
