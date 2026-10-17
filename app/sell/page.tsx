import { redirect } from "next/navigation";
import { NeedsBackend } from "@/components/SetupNotice";
import SellForm from "@/components/SellForm";
import { getCategories, getCities } from "@/lib/data";
import { currentUser, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Sell() {
  if (!hasSupabase) return <NeedsBackend />;
  if (!(await currentUser())) redirect("/login?next=/sell");
  const [cats, cities] = await Promise.all([getCategories(), getCities()]);
  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold md:text-3xl">Sell on Mazad</h1>
        <p className="text-sm text-muted">Three quick steps. You can start at EGP 1 and let buyers set the price.</p>
      </div>
      <SellForm categories={cats} cities={cities} />
    </div>
  );
}
