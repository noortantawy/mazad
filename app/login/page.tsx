import AuthForm from "@/components/AuthForm";
import { NeedsBackend } from "@/components/SetupNotice";
import { hasSupabase } from "@/lib/supabase/server";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (!hasSupabase) return <NeedsBackend />;
  // Only allow same-site redirects.
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";
  return <AuthForm next={safe} />;
}
