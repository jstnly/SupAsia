"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/learn";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function signInGoogle() {
    setError(null);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  async function continueAsGuest() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) setError(error.message);
    else router.push(next);
  }

  if (sent) {
    return (
      <div className="space-y-3 rounded-2xl bg-[var(--color-jade-50)] p-4 text-center">
        <Mail className="mx-auto text-[var(--color-jade-600)]" />
        <div className="font-display font-semibold">Check your email</div>
        <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm text-[var(--color-lotus-600)] underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={sendMagicLink} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send magic link"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
            or
          </span>
        </div>
      </div>

      <Button onClick={signInGoogle} variant="secondary" className="w-full">
        Continue with Google
      </Button>

      <Button onClick={continueAsGuest} variant="ghost" className="w-full">
        Try as guest
      </Button>

      {error && (
        <div className="rounded-xl bg-[var(--color-lotus-100)] p-3 text-sm text-[var(--color-lotus-800)]">
          {error}
        </div>
      )}
    </div>
  );
}
