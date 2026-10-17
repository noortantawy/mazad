"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type Result } from "@/app/actions";

export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [state, action, pending] = useActionState<Result, FormData>(mode === "in" ? signIn : signUp, {});

  return (
    <form action={action} className="card mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-bold">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
      <input type="hidden" name="next" value={next} />
      {mode === "up" && (
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" name="name" className="input" autoComplete="name" required />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" minLength={6} className="input"
          autoComplete={mode === "in" ? "current-password" : "new-password"} required />
      </div>
      {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "One moment…" : mode === "in" ? "Sign in" : "Sign up"}
      </button>
      <button type="button" className="w-full text-center text-sm text-muted underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
