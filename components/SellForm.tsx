"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAuction } from "@/app/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

const STEPS = ["Photos", "Details", "Pricing"];
const DURATIONS = [
  { label: "1 hour", h: 1 }, { label: "6 hours", h: 6 }, { label: "24 hours", h: 24 },
  { label: "3 days", h: 72 }, { label: "7 days", h: 168 },
];

export default function SellForm({ categories, cities }: { categories: Category[]; cities: string[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]?.id ?? 1);
  const [condition, setCondition] = useState("used");
  const [city, setCity] = useState(cities[0] ?? "Cairo");
  const [priceMode, setPriceMode] = useState<"start" | "open">("start");
  const [startPrice, setStartPrice] = useState("");
  const [reserveOn, setReserveOn] = useState(false);
  const [reserve, setReserve] = useState("");
  const [timed, setTimed] = useState(true);
  const [hours, setHours] = useState(24);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const previews = files.map((f) => URL.createObjectURL(f));

  function next() {
    setError("");
    if (step === 1 && (title.trim().length < 3 || !description.trim())) return setError("Add a title (3+ characters) and a short description.");
    setStep(step + 1);
  }

  async function submit() {
    setError("");
    const start = priceMode === "open" ? 1 : Number(startPrice);
    if (priceMode === "start" && !(start >= 1)) return setError("Enter a starting price of at least EGP 1.");
    if (reserveOn && !(Number(reserve) >= start)) return setError("The reserve must be at least the starting price.");
    setBusy(true);
    try {
      const sb = supabaseBrowser();
      const { data: u } = await sb.auth.getUser();
      if (!u.user) throw new Error("Please sign in to sell.");
      const urls: string[] = [];
      for (const f of files) {
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${u.user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await sb.storage.from("auction-images").upload(path, f, { contentType: f.type });
        if (upErr) throw new Error(upErr.message);
        urls.push(sb.storage.from("auction-images").getPublicUrl(path).data.publicUrl);
      }
      const r = await createAuction({
        title, description, category, images: urls, condition, city,
        startPrice: start, openToHighest: priceMode === "open",
        reserve: reserveOn ? Number(reserve) : null,
        durationHours: timed ? hours : null,
      });
      if (r.error) throw new Error(r.error);
      router.push(`/auction/${r.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <ol className="flex gap-2" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}
            className={`flex-1 rounded-full px-3 py-1.5 text-center text-sm font-medium ${i === step ? "bg-teal text-on-teal" : i < step ? "bg-teal-soft text-teal" : "bg-surface text-muted border border-line"}`}>
            {s}
          </li>
        ))}
      </ol>

      <div className="card space-y-4 p-5">
        {step === 0 && (
          <>
            <h2 className="text-lg font-bold">Add photos</h2>
            <p className="text-sm text-muted">Clear photos from several angles get more bids. Up to 6.</p>
            <input id="photos" type="file" accept="image/*" multiple className="input"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 6))} />
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p} src={p} alt="" className="aspect-square w-full rounded-md object-cover" />
                ))}
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-lg font-bold">Describe it</h2>
            <div><label htmlFor="title" className="label">Title</label>
              <input id="title" className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. iPhone 13 128GB, battery 91%" /></div>
            <div><label htmlFor="desc" className="label">Description</label>
              <textarea id="desc" rows={4} className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, what's included, any flaws." /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div><label htmlFor="cat" className="label">Category</label>
                <select id="cat" className="input" value={category} onChange={(e) => setCategory(Number(e.target.value))}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</select></div>
              <div><label htmlFor="cond" className="label">Condition</label>
                <select id="cond" className="input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="new">New</option><option value="like_new">Like new</option><option value="used">Used</option></select></div>
              <div><label htmlFor="city" className="label">City</label>
                <select id="city" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
                  {cities.map((c) => <option key={c}>{c}</option>)}</select></div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold">Price and timing</h2>
            <fieldset className="space-y-2">
              <legend className="label">How should bidding start?</legend>
              {([["start", "Set a starting price", "Bids begin at the price you choose."], ["open", "Open to highest bidder", "Starts at EGP 1. The market sets the price."]] as const).map(([v, t, d]) => (
                <label key={v} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${priceMode === v ? "border-teal bg-teal-soft" : "border-line"}`}>
                  <input type="radio" name="pm" checked={priceMode === v} onChange={() => setPriceMode(v)} className="mt-1" />
                  <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted">{d}</span></span>
                </label>
              ))}
            </fieldset>
            {priceMode === "start" && (
              <div><label htmlFor="sp" className="label">Starting price (EGP)</label>
                <input id="sp" inputMode="numeric" className="input tnum" value={startPrice} onChange={(e) => setStartPrice(e.target.value.replace(/[^\d.]/g, ""))} /></div>
            )}
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={reserveOn} onChange={(e) => setReserveOn(e.target.checked)} />
              Don't sell below a minimum (hidden reserve)
            </label>
            {reserveOn && (
              <div><label htmlFor="rv" className="label">Minimum you'll accept (EGP)</label>
                <input id="rv" inputMode="numeric" className="input tnum" value={reserve} onChange={(e) => setReserve(e.target.value.replace(/[^\d.]/g, ""))} />
                <p className="mt-1 text-xs text-muted">Buyers see that a reserve exists, not the amount. If bidding ends below it, nothing is sold and deposits are refunded.</p></div>
            )}
            <fieldset className="space-y-2">
              <legend className="label">Duration</legend>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="dur" checked={timed} onChange={() => setTimed(true)} /> Ends automatically</label>
              {timed && (
                <div className="flex flex-wrap gap-2 pl-6">
                  {DURATIONS.map((d) => (
                    <button key={d.h} type="button" onClick={() => setHours(d.h)}
                      className={`btn btn-ghost !py-1.5 text-sm ${hours === d.h ? "!border-teal !text-teal" : ""}`}>{d.label}</button>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="dur" checked={!timed} onChange={() => setTimed(false)} /> No end time. I'll close it when I'm happy with the bid.</label>
            </fieldset>
          </>
        )}

        {error && <p role="alert" className="text-sm text-bad">{error}</p>}

        <div className="flex justify-between gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={step === 0 || busy}>Back</button>
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={next}>Continue</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? "Publishing…" : "Publish auction"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
