import { hasSupabase } from "@/lib/supabase/server";

/** Shown on pages that need the backend when Supabase is not configured. */
export function PreviewBanner() {
  if (hasSupabase) return null;
  return (
    <div className="mb-5 rounded-lg border border-brass bg-brass-soft px-4 py-3 text-sm">
      <strong>Preview mode.</strong> You are looking at sample auctions. Connect Supabase (see README) to sign in, bid and sell.
    </div>
  );
}

export function NeedsBackend() {
  return (
    <div className="card mx-auto max-w-lg p-6">
      <h1 className="text-xl font-bold">Connect Supabase to use this page</h1>
      <p className="mt-2 text-sm text-muted">
        Sign-in, bidding, selling and the wallet need the database. Create a free Supabase project, run
        <code className="mx-1 rounded bg-teal-soft px-1.5 py-0.5">supabase/migrations/0001_schema.sql</code> and
        <code className="mx-1 rounded bg-teal-soft px-1.5 py-0.5">supabase/seed.sql</code>, then add the keys to
        <code className="mx-1 rounded bg-teal-soft px-1.5 py-0.5">.env.local</code>.
      </p>
    </div>
  );
}
