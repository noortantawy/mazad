"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Re-renders the server page whenever this auction row or its bids change. */
export default function LiveRefresh({ auctionId }: { auctionId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || auctionId.startsWith("demo-")) return;
    const sb = supabaseBrowser();
    const refresh = () => router.refresh();
    const ch = sb
      .channel(`auction-${auctionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids", filter: `auction_id=eq.${auctionId}` }, refresh)
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [auctionId, router]);

  return null;
}
