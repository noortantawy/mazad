"use client";

import { useActionState, useState } from "react";
import { topUp, type Result } from "@/app/actions";

export default function TopUpForm() {
  const [amount, setAmount] = useState("500");
  const [state, action, pending] = useActionState<Result, FormData>(topUp, {});

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[200, 500, 1000, 5000].map((n) => (
          <button key={n} type="button" onClick={() => setAmount(String(n))}
            className={`btn btn-ghost tnum !py-1.5 text-sm ${String(n) === amount ? "!border-teal !text-teal" : ""}`}>
            EGP {n.toLocaleString("en-US")}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="amount" className="label">Amount (EGP)</label>
        <input id="amount" name="amount" inputMode="numeric" className="input tnum" value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Adding…" : "Add to wallet"}</button>
      <p className="text-xs text-muted">Test wallet: no real money moves. Paymob and Fawry plug in here later.</p>
      {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
    </form>
  );
}
